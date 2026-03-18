// src/validators/historyValidator.js
import { body, query } from 'express-validator';

export const addToHistoryValidator = [
  body('movieId')
    .notEmpty().withMessage('Movie ID is required')
    .isNumeric().withMessage('Movie ID must be a number')
    .toInt(),
  body('movieType')
    .optional()
    .isIn(['movie', 'tv'])
    .withMessage('Movie type must be "movie" or "tv"'),
  body('movieData')
    .optional()
    .isObject()
    .withMessage('movieData must be an object'),
];

export const historyPaginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100')
    .toInt(),
];