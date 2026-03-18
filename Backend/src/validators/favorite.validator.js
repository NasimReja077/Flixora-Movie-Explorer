// src/validators/favoriteValidator.js
import { body, param } from "express-validator";

// Add movie to favorites
export const addFavoriteValidator = [
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

// Get favorites pagination
export const movieIdParamValidator = [
  param("movieId")
    .notEmpty()
    .withMessage("Movie ID is required")
    .bail()
    .isNumeric()
    .withMessage("Movie ID must be a number")
    .toInt(),
];