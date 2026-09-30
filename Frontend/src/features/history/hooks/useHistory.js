import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addHistory,
  clearHistory,
  clearHistoryError,
  fetchHistory,
} from "../store/history.slice.js";

export function useHistory() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.history);

  return {
    items,
    loading,
    error,
    fetchHistory: useCallback(
      (limit) => dispatch(fetchHistory(limit)),
      [dispatch]
    ),
    addHistory: useCallback(
      (payload) => dispatch(addHistory(payload)),
      [dispatch]
    ),
    clearHistory: useCallback(() => dispatch(clearHistory()), [dispatch]),
    clearHistoryError: useCallback(
      () => dispatch(clearHistoryError()),
      [dispatch]
    ),
  };
}

export default useHistory;
