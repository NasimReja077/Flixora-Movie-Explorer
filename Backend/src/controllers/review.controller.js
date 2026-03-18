import {Review} from '../models/Review.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { movieId, movieType, rating, content, spoiler } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      user: req.user.id,
      movieId,
    });

    if (existingReview) {
      return next(new ApiError(400, 'You have already reviewed this movie'));
    }

    const review = await Review.create({
      user: req.user.id,
      movieId,
      movieType,
      rating,
      content,
      spoiler: spoiler ?? false,
    });

    await review.populate('user', 'name avatar');

    res.status(201).json(
      new ApiResponse(201, { review }, 'Review created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const { rating, content, spoiler } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ApiError(404, 'Review not found'));
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to update this review'));
    }

    // review.rating = rating || review.rating;
    // review.content = content || review.content;
    // review.spoiler = spoiler || review.spoiler

    if (rating !== undefined) review.rating = rating;
    if (content !== undefined) review.content = content;
    if (spoiler !== undefined) review.spoiler = spoiler;

    await review.save();
    await review.populate('user', 'name avatar');

    res.status(200).json(
      new ApiResponse(200, { review }, 'Review updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ApiError(404, 'Review not found'));
    }

    // const userId = req.user.id || req.user._id;
    console.log("Review Owner:", review.user.toString());
    console.log("Logged User:", req.user._id.toString());

    // const isOwner = review.user.toString() === req.user._id;
    // const isAdmin = req.user.role === "admin";
    // const isOwner = review.user.toString() === userId.toString();

    // const isOwner = review.user.toString() === req.user._id.toString();
    const isOwner = review.user.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return next(new ApiError(403, "You can only delete your own reviews"));
    }

    // // Check ownership
    // if (review.user.toString() !== req.user.id) {
    //   return next(new ApiError(403, 'Not authorized to delete this review'));
    // }

    await review.deleteOne();

    res.status(200).json(
      new ApiResponse(200, null, 'Review deleted successfully')
    );
  } catch (error) {
    next(error);
  }

};

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
export const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const parsedMovieId = parseInt(movieId);

    const reviews = await Review.find({ movieId: parsedMovieId })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ movieId: parsedMovieId })

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { movieId: parseInt(movieId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    // const totalAvgRating = avgRating[0]?.avg || 0;
    const totalAvgRating = avgRating[0]?.avgRating || 0;

    res.status(200).json(
      new ApiResponse(200, {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        totalAvgRating: Math.round(totalAvgRating * 10) / 10,
      }, 'Reviews fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike review
// @route   POST /api/reviews/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ApiError(404, 'Review not found'));
    }

    const userIndex = review.likes.indexOf(req.user.id);

    if (userIndex > -1) {
      // Unlike
      review.likes.splice(userIndex, 1);
    } else {
      // Like
      review.likes.push(req.user.id);
    }

    await review.save();

    res.status(200).json(
      new ApiResponse(200, { likesCount: review.likes.length }, 'Like toggled successfully')
    );
  } catch (error) {
    next(error);
  }
};


// @desc    Get logged-in user's reviews
// @route   GET /api/reviews/user
// @access  Private
export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.status(200).json(
      new ApiResponse(200, { reviews }, 'User reviews fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};