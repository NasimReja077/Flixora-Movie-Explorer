import {User} from'../models/User.model.js';
import {Movie} from'../models/Movie.model.js';
import {Review} from'../models/Review.model.js';
import {Favorite} from'../models/Favorite.model.js';
import {WatchHistory} from'../models/WatchHistory.model.js';
import ApiError from'../utils/ApiError.js';
import ApiResponse from'../utils/ApiResponse.js';


// MOVIE MANAGEMENT

// @desc    Add movie (admin)
// @route   POST /api/admin/movies
// @access  Private/Admin
export const addMovie = async (req, res, next) => {
  try {
    const movieData = {
      ...req.body,
      addedBy: req.user.id,
    };

    const movie = await Movie.create(movieData);

    res.status(201).json(
      new ApiResponse(201, { movie }, 'Movie added successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (admin)
// @route   PUT /api/admin/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return next(new ApiError(404, 'Movie not found'));
    }

    res.status(200).json(
      new ApiResponse(200, { movie }, 'Movie updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (admin)
// @route   DELETE /api/admin/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return next(new ApiError(404, 'Movie not found'));
    }

    await movie.deleteOne();

    res.status(200).json(
      new ApiResponse(200, null, 'Movie deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all movies (admin)
// @route   GET /api/admin/movies
// @access  Private/Admin
export const getAllMovies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const movies = await Movie.find()
      .populate('addedBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Movie.countDocuments();

    res.status(200).json(
      new ApiResponse(200, {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }, 'Movies fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};


// USER MANAGEMENT

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json(
      new ApiResponse(200, {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }, 'Users fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Ban/Unban user (admin)
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
export const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (user.role === 'admin') {
      return next(new ApiError(403, 'Cannot ban admin users'));
    }

    user.isBanned = !user.isBanned;
     await user.save({ validateBeforeSave: false });

    res.status(200).json(
      new ApiResponse(
        200,
        { user },
        `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`
      )
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (user.role === 'admin') {
      return next(new ApiError(403, 'Cannot delete admin users'));
    }

    await user.deleteOne();

    res.status(200).json(
      new ApiResponse(200, null, 'User deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const promoteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.json(
      new ApiResponse(200, { role: user.role }, `User role updated`)
    );
  } catch (error) {
    next(error);
  }
};


// ANALYTICS

// @desc    Get dashboard stats (admin)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalMovies, totalReviews, mostFavorited, mostViewed, recentUsers] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Review.countDocuments(),
      Favorite.aggregate([
        { $group: { _id: '$movieId', count: { $sum: 1 }, movieData: { $first: '$movieData' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      WatchHistory.aggregate([
        { $group: { _id: '$movieId', count: { $sum: 1 }, movieData: { $first: '$movieData' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      User.find().select('username email avatar createdAt').sort('-createdAt').limit(5),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        totalUsers,
        totalMovies,
        totalReviews,
        mostFavorited,
        mostViewed,
        recentUsers,
      }, 'Dashboard stats fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};