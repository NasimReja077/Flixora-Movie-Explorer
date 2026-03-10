// src/validators/movieValidator.js
import { body, query } from 'express-validator';

const addMovieValidator = [
  body('tmdbId')
    .notEmpty()
    .withMessage('TMDB ID is required')
    .isNumeric()
    .withMessage('TMDB ID must be a number'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('posterUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Poster URL must be a valid URL'),
  body('backdropUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Backdrop URL must be a valid URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('releaseDate')
    .optional()
    .isISO8601()
    .withMessage('Release date must be a valid date'),
  body('trailerUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Trailer URL must be a valid URL'),
  body('genres')
    .optional()
    .isArray()
    .withMessage('Genres must be an array'),
  body('category')
    .optional()
    .isIn(['movie', 'tv'])
    .withMessage('Category must be either "movie" or "tv"'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),
  body('runtime')
    .optional()
    .isNumeric()
    .withMessage('Runtime must be a number'),
  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Language code must be between 2 and 10 characters'),
];

const updateMovieValidator = [
  body('tmdbId')
    .optional()
    .isNumeric()
    .withMessage('TMDB ID must be a number'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('posterUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Poster URL must be a valid URL'),
  body('backdropUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Backdrop URL must be a valid URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('releaseDate')
    .optional()
    .isISO8601()
    .withMessage('Release date must be a valid date'),
  body('trailerUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Trailer URL must be a valid URL'),
  body('genres')
    .optional()
    .isArray()
    .withMessage('Genres must be an array'),
  body('category')
    .optional()
    .isIn(['movie', 'tv'])
    .withMessage('Category must be either "movie" or "tv"'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),
  body('runtime')
    .optional()
    .isNumeric()
    .withMessage('Runtime must be a number'),
  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Language code must be between 2 and 10 characters'),
];

const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

const searchValidator = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  ...paginationValidator,
];

const discoverValidator = [
  query('with_genres')
    .optional()
    .isString()
    .withMessage('Genres must be a string'),
  query('sort_by')
    .optional()
    .isIn([
      'popularity.desc',
      'popularity.asc',
      'release_date.desc',
      'release_date.asc',
      'vote_average.desc',
      'vote_average.asc',
      'title.asc',
      'title.desc',
    ])
    .withMessage('Invalid sort option'),
  query('year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Year must be between 1900 and 2100'),
  query('vote_average.gte')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),
  ...paginationValidator,
];

export default {
  addMovieValidator,
  updateMovieValidator,
  paginationValidator,
  searchValidator,
  discoverValidator,
};