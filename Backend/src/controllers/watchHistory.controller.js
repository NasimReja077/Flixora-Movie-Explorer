import { WatchHistory } from '../models/WatchHistory.model.js';
import ApiResponse from '../utils/ApiResponse.js';
// import ApiError from '../utils/ApiError.js';

// @desc    Add to watch history
// @route   POST /api/watch-history
// @access  Private
export const addToHistory = async (req, res, next) => {
  try {
    const { movieId, movieType, movieData } = req.body;
    const userId = req.user._id;

    // Check if already exists (same user + movieId + movieType)
    let history = await WatchHistory.findOne({
      user: userId,
      movieId: Number(movieId),
      movieType,
    });

    if (history) {
      // Update timestamp only
      history.watchedAt = Date.now();
      await history.save();
      return res.status(200).json(
        new ApiResponse(200, { history }, 'Watch history updated')
      );
    }

    // Create new
    history = await WatchHistory.create({
      user: userId,
      movieId: Number(movieId),
      movieType,
      movieData,
    });

    res.status(201).json(
      new ApiResponse(201, { history }, 'Added to watch history')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get watch history
// @route   GET /api/watch-history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const history = await WatchHistory.find({ user: req.user._id })
      .sort('-watchedAt')
      .limit(limit);

    res.status(200).json(
      new ApiResponse(200, { history, count: history.length }, 'Watch history fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Clear watch history
// @route   DELETE /api/watch-history
// @access  Private
export const clearHistory = async (req, res, next) => {
  try {
    const result = await WatchHistory.deleteMany({ user: req.user._id });

    res.status(200).json(
      new ApiResponse(200, { deletedCount: result.deletedCount }, 'Watch history cleared')
    );
  } catch (error) {
    next(error);
  }
};