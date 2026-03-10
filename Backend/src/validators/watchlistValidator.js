// src/validators/watchlistValidator.js
import { body, param, query } from "express-validator";

// Add movie to watchlist
const addWatchlistValidator = [
  body("movieId")
    .notEmpty()
    .withMessage("Movie ID is required")
    .bail()
    .isNumeric()
    .withMessage("Movie ID must be a number"),

  body("movieType")
    .optional()
    .isIn(["movie", "tv"])
    .withMessage('Movie type must be either "movie" or "tv"'),
];

// Remove movie from watchlist
const removeWatchlistValidator = [
  param("movieId")
    .notEmpty()
    .withMessage("Movie ID is required")
    .bail()
    .isNumeric()
    .withMessage("Movie ID must be a number"),
];

// Watchlist pagination
const watchlistPaginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export default {
  addWatchlistValidator,
  removeWatchlistValidator,
  watchlistPaginationValidator,
};