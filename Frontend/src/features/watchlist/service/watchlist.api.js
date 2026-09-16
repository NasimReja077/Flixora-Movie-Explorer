import api from "../../Shared/services/api.js";


// ─── Watchlist ────────────────────────────────────────────────────────────────
export const getWatchlist = () =>
  api.get("/watchlist").then((r) => r.data.data);

export const addToWatchlist = (movieId, movieType = "movie", movieData = {}) =>
  api
    .post("/watchlist", { movieId, movieType, movieData })
    .then((r) => r.data.data);

export const removeFromWatchlist = (movieId) =>
  api.delete(`/watchlist/${movieId}`).then((r) => r.data.data);
