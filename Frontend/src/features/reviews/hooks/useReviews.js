import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearReviewsError,
  createReview,
  deleteReview,
  fetchMyReviews,
  fetchReviews,
  likeReview,
  updateReview,
} from "../store/review.slice.js";

export function useReviews() {
  const dispatch = useDispatch();
  const {
    items,
    myReviews,
    pagination,
    totalAvgRating,
    loading,
    error,
  } = useSelector((state) => state.reviews);

  return {
    items,
    myReviews,
    pagination,
    totalAvgRating,
    loading,
    error,
    fetchReviews: useCallback(
      (payload) => dispatch(fetchReviews(payload)),
      [dispatch]
    ),
    fetchMyReviews: useCallback(
      () => dispatch(fetchMyReviews()),
      [dispatch]
    ),
    createReview: useCallback(
      (payload) => dispatch(createReview(payload)),
      [dispatch]
    ),
    updateReview: useCallback(
      (payload) => dispatch(updateReview(payload)),
      [dispatch]
    ),
    deleteReview: useCallback(
      (reviewId) => dispatch(deleteReview(reviewId)),
      [dispatch]
    ),
    likeReview: useCallback(
      (reviewId) => dispatch(likeReview(reviewId)),
      [dispatch]
    ),
    clearReviewsError: useCallback(
      () => dispatch(clearReviewsError()),
      [dispatch]
    ),
  };
}

export default useReviews;
