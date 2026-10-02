import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './AppLayout.jsx';

import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import GuestRoute from '../routes/GuestRoute.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Signup from '../features/auth/pages/Signup.jsx';
import ForgotPassword from '../features/auth/pages/ForgotPassword.jsx';
import VerifyOtp from '../features/auth/pages/VerifyOtp.jsx';
import ResetPassword from '../features/auth/pages/ResetPassword.jsx';

export const routes = createBrowserRouter([
  // ── Main app (protected in future) ──────────────────────────────────────
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <div>Home Page</div>,
      },
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

export { ProtectedRoute, GuestRoute };