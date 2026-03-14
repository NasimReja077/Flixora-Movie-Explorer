// Backend/src/routes/tmdb.routes.js
import express from 'express';
import { query, param } from 'express-validator';
import validate from '../middlewares/validationMiddleware.js';

import {
  trending,
  popularMovies,
  topRatedMovies,
  upcomingMovies,
  nowPlayingMovies,
  movieDetails,
  movieReviews,
  movieImages,
  similarMovies,
  movieReleaseDates,
  popularTV,
  topRatedTV,
  tvDetails,
  tvReviews,
  tvImages,
  tvSeasonDetails,
  tvEpisodeDetails,
  discoverMoviesCtrl,
  discoverTVCtrl,
  search,
  genres,
  collectionDetails,
  personDetails,
  personMovieCredits,
  personCombinedCredits,
} from '../controllers/tmdb.controller.js';

const router = express.Router();

// Shared validators

/** Reusable ?page= query validator */
const pageValidator = query('page')
  .optional()
  .isInt({ min: 1 })
  .withMessage('page must be a positive integer');

/** Reusable :id route param validator */
const idValidator = param('id')
  .notEmpty()
  .withMessage('id is required')
  .isInt({ min: 1 })
  .withMessage('id must be a positive integer');

// Trending 
// GET /api/tmdb/trending?mediaType=all&timeWindow=day
router.get(
  '/trending',
  [
    query('mediaType').optional().isIn(['all', 'movie', 'tv', 'person']).withMessage('Invalid mediaType'),
    query('timeWindow').optional().isIn(['day', 'week']).withMessage('timeWindow must be "day" or "week"'),
  ],
  validate,
  trending
);

// Movies

router.get('/movies/popular',    [pageValidator], validate, popularMovies);
router.get('/movies/top-rated',  [pageValidator], validate, topRatedMovies);
router.get('/movies/upcoming',   [pageValidator], validate, upcomingMovies);
router.get(
  '/movies/now-playing',
  [
    pageValidator,
    query('region').optional().isAlpha().isLength({ min: 2, max: 4 }).withMessage('region must be a 2–4 letter country code'),
  ],
  validate,
  nowPlayingMovies
);

// Movie detail routes  –  order matters: specific paths before :id
router.get('/movies/:id',               [idValidator], validate, movieDetails);
router.get('/movies/:id/reviews',       [idValidator, pageValidator], validate, movieReviews);
router.get('/movies/:id/images',        [idValidator], validate, movieImages);
router.get('/movies/:id/similar',       [idValidator, pageValidator], validate, similarMovies);
router.get('/movies/:id/release-dates', [idValidator], validate, movieReleaseDates);

// TV Shows

router.get('/tv/popular',   [pageValidator], validate, popularTV);
router.get('/tv/top-rated', [pageValidator], validate, topRatedTV);

router.get('/tv/:id',        [idValidator], validate, tvDetails);
router.get('/tv/:id/reviews',[idValidator, pageValidator], validate, tvReviews);
router.get('/tv/:id/images', [idValidator], validate, tvImages);

router.get(
  '/tv/:id/season/:seasonNumber',
  [
    idValidator,
    param('seasonNumber').isInt({ min: 0 }).withMessage('seasonNumber must be a non-negative integer'),
  ],
  validate,
  tvSeasonDetails
);

router.get(
  '/tv/:id/season/:seasonNumber/episode/:episodeNumber',
  [
    idValidator,
    param('seasonNumber').isInt({ min: 0 }).withMessage('seasonNumber must be a non-negative integer'),
    param('episodeNumber').isInt({ min: 1 }).withMessage('episodeNumber must be a positive integer'),
  ],
  validate,
  tvEpisodeDetails
);

// ─── Discover ─────────────────────────────────────────────────────────────────
// Supported filters forwarded as-is to TMDB:
//   with_genres, sort_by, year, primary_release_year, vote_average.gte,
//   vote_count.gte, with_original_language, with_cast, with_crew, etc.

router.get(
  '/discover/movies',
  [
    pageValidator,
    query('sort_by')
      .optional()
      .isIn([
        'popularity.desc', 'popularity.asc',
        'release_date.desc', 'release_date.asc',
        'vote_average.desc', 'vote_average.asc',
        'title.asc', 'title.desc',
      ])
      .withMessage('Invalid sort_by value'),
    query('vote_average.gte').optional().isFloat({ min: 0, max: 10 }).withMessage('Must be 0–10'),
    query('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('year must be between 1900–2100'),
  ],
  validate,
  discoverMoviesCtrl
);

router.get(
  '/discover/tv',
  [
    pageValidator,
    query('sort_by')
      .optional()
      .isIn([
        'popularity.desc', 'popularity.asc',
        'first_air_date.desc', 'first_air_date.asc',
        'vote_average.desc', 'vote_average.asc',
      ])
      .withMessage('Invalid sort_by value'),
    query('vote_average.gte').optional().isFloat({ min: 0, max: 10 }).withMessage('Must be 0–10'),
  ],
  validate,
  discoverTVCtrl
);

// ─── Search ───────────────────────────────────────────────────────────────────
// GET /api/tmdb/search?query=batman&page=1
router.get(
  '/search',
  [
    query('query').trim().notEmpty().withMessage('query is required').isLength({ max: 100 }),
    pageValidator,
  ],
  validate,
  search
);

// ─── Genres ───────────────────────────────────────────────────────────────────
// GET /api/tmdb/genres?type=movie
router.get(
  '/genres',
  [query('type').optional().isIn(['movie', 'tv']).withMessage('type must be "movie" or "tv"')],
  validate,
  genres
);

// ─── Collections ──────────────────────────────────────────────────────────────
// GET /api/tmdb/collection/:id
router.get(
  '/collection/:id',
  [idValidator],
  validate,
  collectionDetails
);

// ─── People ───────────────────────────────────────────────────────────────────
router.get('/person/:id',                 [idValidator], validate, personDetails);
router.get('/person/:id/movie-credits',   [idValidator], validate, personMovieCredits);
router.get('/person/:id/combined-credits',[idValidator], validate, personCombinedCredits);

export default router;