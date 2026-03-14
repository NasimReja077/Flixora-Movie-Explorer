// tmdb.service.js
import axios from 'axios';
import { apiKey, baseUrl } from '../config/tmdb.config.js';

const tmdbApi = axios.create({
  baseURL: baseUrl,
  params: {
    api_key: apiKey,
  },
});

// Basic Lists 

// Get Trending (Movies/TV/All)

export const getTrending = async (mediaType = 'all', timeWindow = 'day') => {
  const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
  return response.data;
};

// Get Popular Movies
export const getPopularMovies = async (page = 1) => {
  const response = await tmdbApi.get('/movie/popular', { params: { page } });
  return response.data;
};

// Get Top Rated Movies
export const getTopRatedMovies = async (page = 1) => {
  const response = await tmdbApi.get('/movie/top_rated', { params: { page } });
  return response.data;
};

// Get Upcoming Movies
export const getUpcomingMovies = async (page = 1) => {
  const response = await tmdbApi.get('/movie/upcoming', { params: { page } });
  return response.data;
};

// Now Playing Movies (in theaters)
export const getNowPlayingMovies = async (page = 1, region = 'US') => {
  const response = await tmdbApi.get('/movie/now_playing', { params: { page, region } });
  return response.data;
};

// Popular TV Shows
export const getPopularTVShows = async (page = 1) => {
  const response = await tmdbApi.get('/tv/popular', { params: { page } });
  return response.data;
};


// Top Rated TV Shows
export const getTopRatedTV = async (page = 1) => {
  const response = await tmdbApi.get('/tv/top_rated', { params: { page } });
  return response.data;
};


// Details with extended append_to_response
const DETAIL_APPEND = 'videos,credits,images,similar,recommendations,reviews,keywords,external_ids,watch/providers';

// Get Movie Details
export const getMovieDetails = async (movieId) => {
  const response = await tmdbApi.get(`/movie/${movieId}`, {
    params: { append_to_response: DETAIL_APPEND },
  });
  return response.data;
};

// Get TV Show Details
export const getTVShowDetails = async (tvId) => {
  const response = await tmdbApi.get(`/tv/${tvId}`, {
    params: { append_to_response: DETAIL_APPEND },
  });
  return response.data;
};

// Reviews
export const getMovieReviews = async (movieId, page = 1) => {
  const response = await tmdbApi.get(`/movie/${movieId}/reviews`, { params: { page } });
  return response.data;
};

export const getTVReviews = async (tvId, page = 1) => {
  const response = await tmdbApi.get(`/tv/${tvId}/reviews`, { params: { page } });
  return response.data;
};

// Search Multi
export const searchMulti = async (query, page = 1) => {
  const response = await tmdbApi.get('/search/multi', {
    params: { query, page },
  });
  return response.data;
};

// Discover Movies (supports genre, rating, release date, language, actor, director, etc.)
export const discoverMovies = async (filters = {}, page = 1) => {
  const response = await tmdbApi.get('/discover/movie', {
    params: { ...filters, page },
  });
  return response.data;
};

// Discover TV Shows with Filters
export const discoverTVShows = async (filters = {}, page = 1) => {
  const response = await tmdbApi.get('/discover/tv', {
    params: { ...filters, page },
  });
  return response.data;
};


// Get Genres
export const getGenres = async (type = 'movie') => {
  const response = await tmdbApi.get(`/genre/${type}/list`);
  return response.data;
};


// Collections 
export const getCollectionDetails = async (collectionId) => {
  const response = await tmdbApi.get(`/collection/${collectionId}`, {
    params: { append_to_response: 'images,videos' },
  });
  return response.data;
};

// Get Person Details
// Person / Actor / Director
const PERSON_APPEND = 'movie_credits,tv_credits,combined_credits,images,external_ids';

export const getPersonDetails = async (personId) => {
  const response = await tmdbApi.get(`/person/${personId}`, {
    params: { append_to_response: PERSON_APPEND },
  });
  return response.data;
};

// Get only movie credits for a person (useful for "best movies", sort client-side by vote_average / popularity)
export const getPersonMovieCredits = async (personId) => {
  const response = await tmdbApi.get(`/person/${personId}/movie_credits`);
  return response.data;
};

// Get combined movie + TV credits
export const getPersonCombinedCredits = async (personId) => {
  const response = await tmdbApi.get(`/person/${personId}/combined_credits`);
  return response.data;
};


// Release Dates (sometimes includes certification; box office not reliable here)

export const getMovieReleaseDates = async (movieId) => {
  const response = await tmdbApi.get(`/movie/${movieId}/release_dates`);
  return response.data;
};

// Images & Backdrops

export const getMovieImages = async (movieId) => {
  const response = await tmdbApi.get(`/movie/${movieId}/images`);
  return response.data;
};

export const getTVImages = async (tvId) => {
  const response = await tmdbApi.get(`/tv/${tvId}/images`);
  return response.data;
};

// Similar movie
export const getMovieSimilar = async (movieId, page = 1) => {
  const response = await tmdbApi.get(`/movie/${movieId}/similar`, { params: { page } });
  return response.data;
};


// Get TV Season Details (includes all episodes in the season with basic info)
export const getTVSeasonDetails = async (tvId, seasonNumber) => {
  const response = await tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`, {
    params: {
      append_to_response: 'videos,images,credits,external_ids',  // Optional: add more if needed
    },
  });
  return response.data;
};

// TV Seasons & Episodes

// Get Single TV Episode Details
export const getTVEpisodeDetails = async (tvId, seasonNumber, episodeNumber) => {
  const response = await tmdbApi.get(
    `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
    {
      params: {
        append_to_response: 'videos,images,credits,external_ids,translations,recommendations',
      },
    }
  );
  return response.data;
};


// Optional: Get list of episodes for a season (alternative if you only want episodes array without season metadata)
export const getTVEpisodeList = async (tvId, seasonNumber) => {
  const season = await getTVSeasonDetails(tvId, seasonNumber);
  return season.episodes || [];
};