import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  resetPassword,
  setUser,
  verifyOtp,
  fetchMe,
} from "../state/auth.slice.js";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error, otpStatus, resetStatus } =
    useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    otpStatus,
    resetStatus,
    registerUser: useCallback(
      (userData) => dispatch(registerUser(userData)),
      [dispatch]
    ),
    loginUser: useCallback(
      (credentials) => dispatch(loginUser(credentials)),
      [dispatch]
    ),
    logoutUser: useCallback(() => dispatch(logoutUser()), [dispatch]),
    fetchMe: useCallback(() => dispatch(fetchMe()), [dispatch]),
    verifyOtp: useCallback((payload) => dispatch(verifyOtp(payload)), [dispatch]),
    resendOtp: useCallback(
      (payload) => dispatch(resendOtp(payload)),
      [dispatch]
    ),
    forgotPassword: useCallback(
      (payload) => dispatch(forgotPassword(payload)),
      [dispatch]
    ),
    resetPassword: useCallback(
      (payload) => dispatch(resetPassword(payload)),
      [dispatch]
    ),
    clearError: useCallback(() => dispatch(clearError()), [dispatch]),
    setUser: useCallback((nextUser) => dispatch(setUser(nextUser)), [dispatch]),
  };
}

export default useAuth;
