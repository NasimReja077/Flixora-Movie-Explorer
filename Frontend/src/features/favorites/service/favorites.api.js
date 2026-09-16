import api from "../../Shared/services/api.js";

// ─── Favorites ────────────────────────────────────────────────────────────────
export const getFavorites = () =>
  api.get("/favorites").then((r) => r.data.data);

export const addFavorite = (movieId, movieType = "movie", movieData = {}) =>
  api
    .post("/favorites", { movieId, movieType, movieData })
    .then((r) => r.data.data);

export const removeFavorite = (movieId) =>
  api.delete(`/favorites/${movieId}`).then((r) => r.data.data);

export const checkFavorite = (movieId) =>
  api.get(`/favorites/check/${movieId}`).then((r) => r.data.data);
