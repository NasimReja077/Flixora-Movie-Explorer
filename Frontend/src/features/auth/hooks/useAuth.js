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
  const { user, isAuthenticated, loading, initialized, error, otpStatus, resetStatus, pendingEmail } =
    useSelector((state) => state.auth);

  const loginHandler = useCallback(
    (arg1, arg2) => {
      const payload =
        typeof arg1 === "object" && arg1 !== null
          ? arg1
          : { email: arg1, password: arg2 };
      return dispatch(loginUser(payload)).unwrap();
    },
    [dispatch]
  );

  const registerHandler = useCallback(
    (arg1, arg2, arg3) => {
      let payload;
      if (typeof arg1 === "object" && arg1 !== null) {
        payload = {
          confirmPassword: arg1.confirmPassword || arg1.password,
          ...arg1,
        };
      } else {
        payload = {
          username: arg1,
          email: arg2,
          password: arg3,
          confirmPassword: arg3,
        };
      }
      return dispatch(registerUser(payload)).unwrap();
    },
    [dispatch]
  );

  const verifyOtpHandler = useCallback(
    (arg1, arg2) => {
      const payload =
        typeof arg1 === "object" && arg1 !== null
          ? arg1
          : { email: arg1, otp: arg2 };
      return dispatch(verifyOtp(payload)).unwrap();
    },
    [dispatch]
  );

  const forgotPasswordHandler = useCallback(
    (payload) => {
      const data = typeof payload === "string" ? { email: payload } : payload;
      return dispatch(forgotPassword(data)).unwrap();
    },
    [dispatch]
  );

  const resendOtpHandler = useCallback(
    (payload) => {
      const data = typeof payload === "string" ? { email: payload } : payload;
      return dispatch(resendOtp(data)).unwrap();
    },
    [dispatch]
  );

  const resetPasswordHandler = useCallback(
    (arg1, arg2, arg3) => {
      let payload;
      if (typeof arg1 === "object" && arg1 !== null) {
        payload = arg1;
      } else if (arg3 !== undefined) {
        payload = {
          token: arg2 || arg1,
          password: arg3,
          confirmPassword: arg3,
          email: arg1,
          otp: arg2,
        };
      } else {
        payload = { token: arg1, password: arg2, confirmPassword: arg2 };
      }
      return dispatch(resetPassword(payload)).unwrap();
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    loading,
    initialized,
    pendingEmail,
    error,
    otpStatus,
    resetStatus,
    login: loginHandler,
    register: registerHandler,
    registerUser: registerHandler,
    loginUser: loginHandler,
    logout: useCallback(() => dispatch(logoutUser()).unwrap(), [dispatch]),
    logoutUser: useCallback(() => dispatch(logoutUser()), [dispatch]),
    fetchMe: useCallback(() => dispatch(fetchMe()), [dispatch]),
    verifyOtp: verifyOtpHandler,
    verifyEmail: verifyOtpHandler,
    resendOtp: resendOtpHandler,
    forgotPassword: forgotPasswordHandler,
    resetPassword: resetPasswordHandler,
    clearError: useCallback(() => dispatch(clearError()), [dispatch]),
    setUser: useCallback((nextUser) => dispatch(setUser(nextUser)), [dispatch]),
  };
}

export default useAuth;
