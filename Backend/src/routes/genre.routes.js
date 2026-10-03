import express from 'express';
import { param, query } from 'express-validator';
import validate from '../middlewares/validationMiddleware.js';
import { genreTitles } from '../controllers/tmdb.controller.js';

const router = express.Router();

router.get(
  '/:genreId/titles',
  [
    param('genreId').isInt({ min: 1 }).withMessage('genreId must be a positive integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('type').optional().isIn(['movie', 'tv']).withMessage('type must be "movie" or "tv"'),
    query('sort_by').optional().custom((value, { req }) => {
      const movieSorts = [
        'popularity.desc', 'popularity.asc',
        'release_date.desc', 'release_date.asc',
        'vote_average.desc', 'vote_average.asc',
        'title.asc', 'title.desc',
      ];
      const tvSorts = [
        'popularity.desc', 'popularity.asc',
        'first_air_date.desc', 'first_air_date.asc',
        'vote_average.desc', 'vote_average.asc',
      ];
      const allowedSorts = req.query.type === 'tv' ? tvSorts : movieSorts;
      if (!allowedSorts.includes(value)) {
        throw new Error('Invalid sort_by value for the selected type');
      }
      return true;
    }),
  ],
  validate,
  genreTitles
);

export default router;
