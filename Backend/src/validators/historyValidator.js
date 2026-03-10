// src/validators/historyValidator.js
import { body, param, query } from "express-validator";

// Add movie to watch history
const addHistoryValidator = [
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

  body("progress")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Progress must be between 0 and 100"),

  body("watchedAt")
    .optional()
    .isISO8601()
    .withMessage("Watched date must be a valid date"),
];

// Get history pagination
const historyPaginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// Delete history item
const deleteHistoryValidator = [
  param("id")
    .notEmpty()
    .withMessage("History ID is required")
    .isMongoId()
    .withMessage("Invalid history ID"),
];

export default {
  addHistoryValidator,
  historyPaginationValidator,
  deleteHistoryValidator,
};