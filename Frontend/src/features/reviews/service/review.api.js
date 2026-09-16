import api from "../../Shared/services/api.js";


// ─── Reviews ──────────────────────────────────────────────────────────────────
export const getReviews = (movieId, page = 1) =>
  api
    .get(`/reviews/movie/${movieId}`, { params: { page } })
    .then((r) => r.data.data);

export const createReview = (movieId, data) =>
  api.post("/reviews", { movieId, ...data }).then((r) => r.data.data);

export const updateReview = (id, data) =>
  api.put(`/reviews/${id}`, data).then((r) => r.data.data);

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`).then((r) => r.data.data);

export const likeReview = (id) =>
  api.post(`/reviews/${id}/like`).then((r) => r.data.data);

export const getMyReviews = () =>
  api.get("/reviews/user").then((r) => r.data.data);
