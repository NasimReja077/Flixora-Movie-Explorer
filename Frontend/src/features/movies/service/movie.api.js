import api from "../../Shared/services/api.js";

// Local movie CRUD endpoints
export const getMovies = () => api.get("/movies");
export const getMovieById = (id) => api.get(`/movies/${id}`);
export const createMovie = (payload) => api.post("/movies", payload);
export const updateMovie = (id, payload) => api.put(`/movies/${id}`, payload);
export const deleteMovie = (id) => api.delete(`/movies/${id}`);
export const searchMovies = (query) => api.get(`/movies/search?query=${query}`);
export const getMoviesByGenre = (genre) => api.get(`/movies/genre/${genre}`);
export const getMoviesByDirector = (director) => api.get(`/movies/director/${director}`);
export const getMoviesByActor = (actor) => api.get(`/movies/actor/${actor}`);
export const getMoviesByYear = (year) => api.get(`/movies/year/${year}`);
export const getMoviesByRating = (rating) => api.get(`/movies/rating/${rating}`);
export const getMoviesByLanguage = (language) => api.get(`/movies/language/${language}`);
export const getMoviesByCountry = (country) => api.get(`/movies/country/${country}`);
export const getMoviesByDuration = (duration) => api.get(`/movies/duration/${duration}`);
export const getMoviesByReleaseDate = (releaseDate) => api.get(`/movies/release-date/${releaseDate}`);
export const getMoviesByPopularity = (popularity) => api.get(`/movies/popularity/${popularity}`);
export const getMoviesByVotes = (votes) => api.get(`/movies/votes/${votes}`);
export const getMoviesByRevenue = (revenue) => api.get(`/movies/revenue/${revenue}`);
export const getMoviesByBudget = (budget) => api.get(`/movies/budget/${budget}`);
export const getMoviesByAwards = (awards) => api.get(`/movies/awards/${awards}`);
export const getMoviesByTag = (tag) => api.get(`/movies/tag/${tag}`);
export const getMoviesByKeyword = (keyword) => api.get(`/movies/keyword/${keyword}`);
export const getMoviesByFranchise = (franchise) => api.get(`/movies/franchise/${franchise}`);

// TMDB movie / TV / series API endpoints
export const getTrendingMedia = (mediaType = "all", timeWindow = "day") =>
  api.get("/tmdb/trending", { params: { mediaType, timeWindow } });

export const getPopularMovies = (page = 1) =>
  api.get("/tmdb/movies/popular", { params: { page } });

export const getTopRatedMovies = (page = 1) =>
  api.get("/tmdb/movies/top-rated", { params: { page } });

export const getUpcomingMovies = (page = 1) =>
  api.get("/tmdb/movies/upcoming", { params: { page } });

export const getNowPlayingMovies = (page = 1, region = "US") =>
  api.get("/tmdb/movies/now-playing", { params: { page, region } });

export const getMovieDetails = (id) => api.get(`/tmdb/movies/${id}`);
export const getMovieReviews = (id, page = 1) =>
  api.get(`/tmdb/movies/${id}/reviews`, { params: { page } });
export const getMovieImages = (id) => api.get(`/tmdb/movies/${id}/images`);
export const getSimilarMovies = (id, page = 1) =>
  api.get(`/tmdb/movies/${id}/similar`, { params: { page } });
export const getMovieReleaseDates = (id) => api.get(`/tmdb/movies/${id}/release-dates`);

export const getPopularTVShows = (page = 1) =>
  api.get("/tmdb/tv/popular", { params: { page } });

export const getTopRatedTVShows = (page = 1) =>
  api.get("/tmdb/tv/top-rated", { params: { page } });

export const getTVShowDetails = (id) => api.get(`/tmdb/tv/${id}`);
export const getTVShowReviews = (id, page = 1) =>
  api.get(`/tmdb/tv/${id}/reviews`, { params: { page } });
export const getTVShowImages = (id) => api.get(`/tmdb/tv/${id}/images`);
export const getTVSeasonDetails = (id, seasonNumber) =>
  api.get(`/tmdb/tv/${id}/season/${seasonNumber}`);
export const getTVEpisodeDetails = (id, seasonNumber, episodeNumber) =>
  api.get(`/tmdb/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`);

export const discoverMovies = (params = {}) =>
  api.get("/tmdb/discover/movies", { params });

export const discoverTVShows = (params = {}) =>
  api.get("/tmdb/discover/tv", { params });

export const searchTMDB = (query, page = 1) =>
  api.get("/tmdb/search", { params: { query, page } });

export const getGenres = (type = "movie") =>
  api.get("/tmdb/genres", { params: { type } });

export const getCollectionDetails = (id) => api.get(`/tmdb/collection/${id}`);
export const getPersonDetails = (id) => api.get(`/tmdb/person/${id}`);
export const getPersonMovieCredits = (id) => api.get(`/tmdb/person/${id}/movie-credits`);
export const getPersonCombinedCredits = (id) => api.get(`/tmdb/person/${id}/combined-credits`);