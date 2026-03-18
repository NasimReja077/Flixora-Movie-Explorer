import {Favorite} from '../models/Favorite.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// @desc    Add movie to favorites
// @route   POST /api/favorites
// @access  Private
export const addFavorite = async (req, res, next) => {
  try {
    const { movieId, movieType, movieData } = req.body;


    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      movieId,
    });

    if (existingFavorite) {
      return next(new ApiError(400, 'Movie already in favorites'));
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      movieId,
      movieType,
      movieData,
    });

    res.status(201).json(
      new ApiResponse(201, { favorite }, 'Added to favorites')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from favorites
// @route   DELETE /api/favorites/:movieId
// @access  Private
export const removeFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      movieId,
    });

    if (!favorite) {
      return next(new ApiError(404, 'Favorite not found'));
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Removed from favorites')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json(
      new ApiResponse(200, { favorites, count: favorites.length }, 'Favorites fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Check if movie is favorited
// @route   GET /api/favorites/check/:movieId
// @access  Private
export const checkFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user.id,
      movieId,
    });

    res.status(200).json(
      new ApiResponse(200, { isFavorite: !!favorite }, 'Check completed')
    );
  } catch (error) {
    next(error);
  }
}; 