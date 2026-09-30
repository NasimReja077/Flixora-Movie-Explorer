import api from "../../Shared/services/api.js";

export const getAdminMovies = (params = {}) =>
  api.get("/admin/movies", { params }).then((response) => response.data.data);

export const addAdminMovie = (movieData) =>
  api.post("/admin/movies", movieData).then((response) => response.data.data);

export const updateAdminMovie = (movieId, movieData) =>
  api
    .put(`/admin/movies/${movieId}`, movieData)
    .then((response) => response.data.data);

export const deleteAdminMovie = (movieId) =>
  api
    .delete(`/admin/movies/${movieId}`)
    .then((response) => response.data.data);

export const getAdminUsers = (params = {}) =>
  api.get("/admin/users", { params }).then((response) => response.data.data);

export const toggleUserBan = (userId) =>
  api
    .put(`/admin/users/${userId}/ban`)
    .then((response) => response.data.data);

export const deleteAdminUser = (userId) =>
  api
    .delete(`/admin/users/${userId}`)
    .then((response) => response.data.data);

export const toggleUserRole = (userId) =>
  api
    .put(`/admin/users/${userId}/promote`)
    .then((response) => response.data.data);

export const getAdminStats = () =>
  api.get("/admin/stats").then((response) => response.data.data);
