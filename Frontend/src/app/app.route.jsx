import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './AppLayout.jsx';

import GuestRoute from '../routes/GuestRoute.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Signup from '../features/auth/pages/Signup.jsx';
import ForgotPassword from '../features/auth/pages/ForgotPassword.jsx';
import VerifyOtp from '../features/auth/pages/VerifyOtp.jsx';
import ResetPassword from '../features/auth/pages/ResetPassword.jsx';
import GenreExplorer from '../features/movies/pages/GenreExplorer.jsx';
import Home from '../features/movies/pages/Home.jsx';
import MoviePage from '../features/movies/pages/MoviePage.jsx';
import TvShowPage from '../features/movies/pages/TvShowPage.jsx';
import MovieTvDetails from '../features/movies/pages/MovieTvDetails.jsx';
import SearchResults from '../features/movies/pages/SearchResults.jsx';

export const routes = createBrowserRouter([
  // ── Main app (protected in future) ──────────────────────────────────────
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      { path: 'movies', element: <MoviePage /> },
      { path: 'tv', element: <TvShowPage /> },
      { path: 'genres', element: <GenreExplorer /> },
      { path: 'movie/:id', element: <MovieTvDetails /> },
      { path: 'tv/:id', element: <MovieTvDetails /> },
      { path: 'search', element: <SearchResults /> },
    ],
  },

  // ── Guest-only: redirect logged-in users away ────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login',           element: <Login /> },
          { path: 'signup',          element: <Signup /> },
          { path: 'forgot-password', element: <ForgotPassword /> },
        ],
      },
    ],
  },

  // ── Public auth pages (accessible regardless of login state) ────────────
  // verify-otp: unverified user after signup (Redux user still null)
  // reset-password/:token: user arrives via email link, may or may not be logged in
  {
    element: <AuthLayout />,
    children: [
      { path: 'verify-otp',            element: <VerifyOtp /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
    ],
  },

  // ── Catch-all ────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);
