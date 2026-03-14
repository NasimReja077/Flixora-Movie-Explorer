// Backend/src/controllers/tmdb.controller.js
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  getTrending,getPopularMovies,getTopRatedMovies,getUpcomingMovies,getNowPlayingMovies,getPopularTVShows,getTopRatedTV,
  getMovieDetails,getTVShowDetails,getMovieReviews,getTVReviews,searchMulti,discoverMovies,discoverTVShows,getGenres,
  getCollectionDetails,getPersonDetails,getPersonMovieCredits,getPersonCombinedCredits,
  getMovieReleaseDates,getMovieImages,getTVImages,
  getMovieSimilar,getTVSeasonDetails,getTVEpisodeDetails,
} from '../services/tmdb.service.js';



// ─── Helpers
const safeCall = async (fn, next, successData, message = 'Success') => {
  try {
    const data = await fn();
    return res => res.status(200).json(new ApiResponse(200, successData(data), message));
  } catch (err) {
    // TMDB returns axios errors – surface the upstream status when available
    const status = err?.response?.status || 502;
    const msg =
      err?.response?.data?.status_message ||
      err.message ||
      'TMDB service error';
    return () => next(new ApiError(status, `TMDB: ${msg}`));
  }
};

/** Parses ?page=  with a safe fallback to 1. */
const parsePage = (query) => {
  const p = parseInt(query.page, 10);
  return Number.isFinite(p) && p > 0 ? p : 1;
};

/** Builds a standard pagination meta object from a TMDB list response. */
const paginationMeta = (data) => ({
  page: data.page ?? 1,
  totalPages: data.total_pages ?? 1,
  totalResults: data.total_results ?? 0,
});

// Trending 

// GET /api/tmdb/trending?mediaType=all&timeWindow=day

export const trending = async (req, res, next) => {
  try {
    const { mediaType = 'all', timeWindow = 'day' } = req.query;

    const validMedia = ['all', 'movie', 'tv', 'person'];
    const validWindow = ['day', 'week'];

    if (!validMedia.includes(mediaType))
      return next(new ApiError(400, `mediaType must be one of: ${validMedia.join(', ')}`));
    if (!validWindow.includes(timeWindow))
      return next(new ApiError(400, `timeWindow must be one of: ${validWindow.join(', ')}`));

    const data = await getTrending(mediaType, timeWindow);

    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Trending fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// Movies–Lists

// GET /api/tmdb/movies/popular?page=1

export const popularMovies = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const data = await getPopularMovies(page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Popular movies fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/movies/top-rated?page=1
export const topRatedMovies = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const data = await getTopRatedMovies(page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Top rated movies fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};


// GET /api/tmdb/movies/upcoming?page=1
export const upcomingMovies = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const data = await getUpcomingMovies(page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Upcoming movies fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};


// GET /api/tmdb/movies/now-playing?page=1&region=US
export const nowPlayingMovies = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const region = req.query.region || 'US';
    const data = await getNowPlayingMovies(page, region);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Now playing movies fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// Movie–Detail/Supporting

// GET /api/tmdb/movies/:id
export const movieDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getMovieDetails(id);
    res.status(200).json(new ApiResponse(200, data, 'Movie details fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/movies/:id/reviews?page=1
export const movieReviews = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const data = await getMovieReviews(req.params.id, page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Movie reviews fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/movies/:id/images
export const movieImages = async (req, res, next) => {
  try {
    const data = await getMovieImages(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'Movie images fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/movies/:id/similar?page=1
export const similarMovies = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const data = await getMovieSimilar(req.params.id, page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Similar movies fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/movies/:id/release-dates
export const movieReleaseDates = async (req, res, next) => {
  try {
    const data = await getMovieReleaseDates(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'Movie release dates fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

//TV–Lists

// GET /api/tmdb/tv/popular?page=1
export const popularTV = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const data = await getPopularTVShows(page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Popular TV shows fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/tv/top-rated?page=1
export const topRatedTV = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const data = await getTopRatedTV(page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Top rated TV shows fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// TV–Detail/Supporting

// GET /api/tmdb/tv/:id
export const tvDetails = async (req, res, next) => {
  try {
    const data = await getTVShowDetails(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'TV show details fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/tv/:id/reviews?page=1
export const tvReviews = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const data = await getTVReviews(req.params.id, page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'TV reviews fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/tv/:id/images
export const tvImages = async (req, res, next) => {
  try {
    const data = await getTVImages(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'TV images fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/tv/:id/season/:seasonNumber
export const tvSeasonDetails = async (req, res, next) => {
  try {
    const { id, seasonNumber } = req.params;
    const data = await getTVSeasonDetails(id, seasonNumber);
    res.status(200).json(new ApiResponse(200, data, 'Season details fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/tv/:id/season/:seasonNumber/episode/:episodeNumber
export const tvEpisodeDetails = async (req, res, next) => {
  try {
    const { id, seasonNumber, episodeNumber } = req.params;
    const data = await getTVEpisodeDetails(id, seasonNumber, episodeNumber);
    res.status(200).json(new ApiResponse(200, data, 'Episode details fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// Discover

// GET /api/tmdb/discover/movies?page=1&with_genres=28&sort_by=popularity.desc
export const discoverMoviesCtrl = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    // Remove page from filters so it is not sent twice
    const { page: _p, ...filters } = req.query;
    const data = await discoverMovies(filters, page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Discover movies fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/discover/tv?page=1&with_genres=18&sort_by=popularity.desc
export const discoverTVCtrl = async (req, res, next) => {
  try {
    const page = parsePage(req.query);
    const { page: _p, ...filters } = req.query;
    const data = await discoverTVShows(filters, page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Discover TV shows fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// Search

// GET /api/tmdb/search?query=batman&page=1
export const search = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return next(new ApiError(400, 'Search query is required'));
    }
    const page = parsePage(req.query);
    const data = await searchMulti(query.trim(), page);
    res.status(200).json(
      new ApiResponse(200, { results: data.results, pagination: paginationMeta(data) }, 'Search results fetched')
    );
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// Genres

// GET /api/tmdb/genres?type=movie   (type: movie | tv)
export const genres = async (req, res, next) => {
  try {
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const data = await getGenres(type);
    res.status(200).json(new ApiResponse(200, data, 'Genres fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// Collections

// GET /api/tmdb/collection/:id
export const collectionDetails = async (req, res, next) => {
  try {
    const data = await getCollectionDetails(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'Collection details fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// People

// GET /api/tmdb/person/:id
export const personDetails = async (req, res, next) => {
  try {
    const data = await getPersonDetails(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'Person details fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/person/:id/movie-credits
export const personMovieCredits = async (req, res, next) => {
  try {
    const data = await getPersonMovieCredits(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'Person movie credits fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

// GET /api/tmdb/person/:id/combined-credits
export const personCombinedCredits = async (req, res, next) => {
  try {
    const data = await getPersonCombinedCredits(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'Person combined credits fetched'));
  } catch (err) {
    next(new ApiError(err?.response?.status || 502, err?.response?.data?.status_message || err.message));
  }
};

