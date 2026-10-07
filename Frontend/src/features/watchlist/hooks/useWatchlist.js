import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWatchlist,
  clearWatchlistError,
  fetchWatchlist,
  removeFromWatchlist,
  resetWatchlist,
} from "../store/watchlist.slice.js";

export function useWatchlist() {
  const dispatch = useDispatch();
  const { items, pagination, isInWatchlistById, loading, initialized, error } =
    useSelector((state) => state.watchlist);

  return {
    items,
    pagination,
    isInWatchlistById,
    loading,
    initialized,
    error,
    fetchWatchlist: useCallback(() => dispatch(fetchWatchlist()), [dispatch]),
    addToWatchlist: useCallback(
      (payload) => dispatch(addToWatchlist(payload)),
      [dispatch]
    ),
    removeFromWatchlist: useCallback(
      (movieId) => dispatch(removeFromWatchlist(movieId)),
      [dispatch]
    ),
    clearWatchlistError: useCallback(
      () => dispatch(clearWatchlistError()),
      [dispatch]
    ),
    resetWatchlist: useCallback(() => dispatch(resetWatchlist()), [dispatch]),
  };
}

export default useWatchlist;
