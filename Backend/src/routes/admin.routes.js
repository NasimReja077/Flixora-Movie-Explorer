import express from 'express';

import {
  addMovie,
  updateMovie,
  deleteMovie,
  getAllMovies,
  getAllUsers,
  toggleBanUser,
  deleteUser,
  getDashboardStats,
  promoteUser
} from '../controllers/admin.controller.js';

import protect from '../middlewares/auth.middleware.js';
import adminOnly from '../middlewares/admin.middleware.js';
import {
  addMovieValidator,
  updateMovieValidator,
  paginationValidator,
} from '../validators/movie.validator.js';
import validate from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All routes are protected and admin only
router.use(protect, adminOnly);

// Movie management
router.get('/movies', paginationValidator, validate, getAllMovies);
router.post('/movies', addMovieValidator, validate, addMovie);
router.put('/movies/:id', updateMovieValidator, validate, updateMovie);
router.delete('/movies/:id', deleteMovie);

// User management
router.get('/users', paginationValidator, validate, getAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/promote', promoteUser);

// Analytics
router.get('/stats', getDashboardStats);

export default router;