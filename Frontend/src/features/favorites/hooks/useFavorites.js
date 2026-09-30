import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addFavorite,
  checkFavorite,
  clearFavoritesError,
  fetchFavorites,
  removeFavorite,
} from "../store/favorites.slice.js";

export function useFavorites() {
  const dispatch = useDispatch();
  const { items, isFavoriteById, loading, error } = useSelector(
    (state) => state.favorites
  );

  return {
    items,
    isFavoriteById,
    loading,
    error,
    fetchFavorites: useCallback(() => dispatch(fetchFavorites()), [dispatch]),
    addFavorite: useCallback(
      (payload) => dispatch(addFavorite(payload)),
      [dispatch]
    ),
    removeFavorite: useCallback(
      (movieId) => dispatch(removeFavorite(movieId)),
      [dispatch]
    ),
    checkFavorite: useCallback(
      (movieId) => dispatch(checkFavorite(movieId)),
      [dispatch]
    ),
    clearFavoritesError: useCallback(
      () => dispatch(clearFavoritesError()),
      [dispatch]
    ),
  };
}

export default useFavorites;
