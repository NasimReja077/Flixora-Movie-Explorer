import { body, param } from 'express-validator';
const createReviewValidator = [
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required')
    .isNumeric()
    .withMessage('Movie ID must be a number'),
  body('movieType')
    .optional()
    .isIn(['movie', 'tv'])
    .withMessage('Movie type must be either "movie" or "tv"'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Review content is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review content must be between 10 and 2000 characters'),
];

const updateReviewValidator = [
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Review content cannot be empty')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review content must be between 10 and 2000 characters'),
];

const reviewIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Review ID is required')
    .isMongoId()
    .withMessage('Invalid review ID format'),
];

const movieIdValidator = [
  param('movieId')
    .notEmpty()
    .withMessage('Movie ID is required')
    .isNumeric()
    .withMessage('Movie ID must be a number'),
];

export default {
  createReviewValidator,
  updateReviewValidator,
  reviewIdValidator,
  movieIdValidator,
};