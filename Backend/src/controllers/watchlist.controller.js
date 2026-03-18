import { Watchlist } from "../models/Watchlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Add to watchlist
export const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId, movieType, movieData } = req.body;

    const exists = await Watchlist.findOne({
      user: req.user._id,
      movieId,
    });

    if (exists) {
      throw new ApiError(400, "Movie already in watchlist");
    }

    const item = await Watchlist.create({
      user: req.user._id,
      movieId,
      movieType,
      movieData,
    });

    res.status(201).json(
      new ApiResponse(201, { item }, "Added to watchlist")
    );
  } catch (error) {
    next(error);
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const item = await Watchlist.findOneAndDelete({
      user: req.user._id,
      movieId,
    });

    if (!item) {
      throw new ApiError(404, "Item not found in watchlist");
    }

    res.status(200).json(
      new ApiResponse(200, null, "Removed from watchlist")
    );
  } catch (error) {
    next(error);
  }
};

// Get watchlist
export const getWatchlist = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const items = await Watchlist.find({ user: req.user._id })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const total = await Watchlist.countDocuments({
      user: req.user._id,
    });

    res.status(200).json(
      new ApiResponse(200, {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }, "Watchlist fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};