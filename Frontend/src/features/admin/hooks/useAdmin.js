import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAdminMovie,
  clearAdminError,
  deleteAdminMovie,
  deleteAdminUser,
  fetchAdminMovies,
  fetchAdminStats,
  fetchAdminUsers,
  toggleUserBan,
  toggleUserRole,
  updateAdminMovie,
} from "../store/admin.slice.js";

export function useAdmin() {
  const dispatch = useDispatch();
  const {
    movies,
    users,
    moviePagination,
    userPagination,
    stats,
    loading,
    error,
  } = useSelector((state) => state.admin);

  return {
    movies,
    users,
    moviePagination,
    userPagination,
    stats,
    loading,
    error,
    fetchAdminMovies: useCallback(
      (params) => dispatch(fetchAdminMovies(params)),
      [dispatch]
    ),
    addAdminMovie: useCallback(
      (movieData) => dispatch(addAdminMovie(movieData)),
      [dispatch]
    ),
    updateAdminMovie: useCallback(
      (payload) => dispatch(updateAdminMovie(payload)),
      [dispatch]
    ),
    deleteAdminMovie: useCallback(
      (movieId) => dispatch(deleteAdminMovie(movieId)),
      [dispatch]
    ),
    fetchAdminUsers: useCallback(
      (params) => dispatch(fetchAdminUsers(params)),
      [dispatch]
    ),
    toggleUserBan: useCallback(
      (userId) => dispatch(toggleUserBan(userId)),
      [dispatch]
    ),
    deleteAdminUser: useCallback(
      (userId) => dispatch(deleteAdminUser(userId)),
      [dispatch]
    ),
    toggleUserRole: useCallback(
      (userId) => dispatch(toggleUserRole(userId)),
      [dispatch]
    ),
    fetchAdminStats: useCallback(
      () => dispatch(fetchAdminStats()),
      [dispatch]
    ),
    clearAdminError: useCallback(
      () => dispatch(clearAdminError()),
      [dispatch]
    ),
  };
}

export default useAdmin;
