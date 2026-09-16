import api from "../../Shared/services/api.js";


// ─── History ──────────────────────────────────────────────────────────────────
export const getHistory = (limit = 20) =>
  api.get("/watch-history", { params: { limit } }).then((r) => r.data.data);

export const addHistory = (movieId, movieType = "movie", movieData = {}) =>
  api
    .post("/watch-history", { movieId, movieType, movieData })
    .then((r) => r.data.data);

export const clearHistory = () =>
  api.delete("/watch-history").then((r) => r.data.data);