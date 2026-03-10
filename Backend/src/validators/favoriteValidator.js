// src/validators/favoriteValidator.js
import { body, param } from "express-validator";

// Add movie to favorites
const addFavoriteValidator = [
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

// Remove movie from favorites
const removeFavoriteValidator = [
  param("movieId")
    .notEmpty()
    .withMessage("Movie ID is required")
    .bail()
    .isNumeric()
    .withMessage("Movie ID must be a number"),
];

// Get favorites pagination
const favoritePaginationValidator = [
  param("userId")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

export default {
  addFavoriteValidator,
  removeFavoriteValidator,
  favoritePaginationValidator,
};