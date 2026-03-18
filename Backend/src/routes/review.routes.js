import express from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getMovieReviews,
  toggleLike,
  getUserReviews,
} from '../controllers/review.controller.js';
import protect from '../middlewares/auth.middleware.js';
import {
  createReviewValidator,
  updateReviewValidator,
  reviewIdValidator,
  movieIdValidator,
} from '../validators/review.validator.js';

import validate from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Public routes
router.get('/movie/:movieId', movieIdValidator, validate, getMovieReviews);

// Protected routes
router.post('/', protect, createReviewValidator, validate, createReview);
router.put('/:id', protect, reviewIdValidator, updateReviewValidator, validate, updateReview);
router.delete('/:id', protect, reviewIdValidator, validate, deleteReview);
router.post('/:id/like', protect, reviewIdValidator, validate, toggleLike);
router.get('/user', protect, getUserReviews);
export default router;