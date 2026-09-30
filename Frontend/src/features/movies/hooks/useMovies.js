import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMovieError,
  clearSelectedMovie,
  fetchMovieById,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
} from "../store/movies.slice.js";

export function useMovies() {
  const dispatch = useDispatch();
  const {
    trending,
    popular,
    topRated,
    nowPlaying,
    selectedMovie,
    loading,
    error,
  } = useSelector((state) => state.movies);

  return {
    trending,
    popular,
    topRated,
    nowPlaying,
    selectedMovie,
    loading,
    error,
    fetchTrendingMovies: useCallback(
      () => dispatch(fetchTrendingMovies()),
      [dispatch]
    ),
    fetchPopularMovies: useCallback(
      (page) => dispatch(fetchPopularMovies(page)),
      [dispatch]
    ),
    fetchTopRatedMovies: useCallback(
      (page) => dispatch(fetchTopRatedMovies(page)),
      [dispatch]
    ),
    fetchNowPlayingMovies: useCallback(
      (page) => dispatch(fetchNowPlayingMovies(page)),
      [dispatch]
    ),
    fetchMovieById: useCallback(
      (movieId) => dispatch(fetchMovieById(movieId)),
      [dispatch]
    ),
    clearMovieError: useCallback(() => dispatch(clearMovieError()), [dispatch]),
    clearSelectedMovie: useCallback(
      () => dispatch(clearSelectedMovie()),
      [dispatch]
    ),
  };
}

export default useMovies;
