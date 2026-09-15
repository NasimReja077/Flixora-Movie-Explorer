import api from "../../Shared/services/api.js";

export const signupUser = (payload) => api.post("/auth/signup", payload);

export const verifyOtp = (payload) => api.post("/auth/verify-otp", payload);

export const resendOtp = (payload) => api.post("/auth/resend-otp", payload);

export const loginUser = (payload) => api.post("/auth/login", payload);

export const logoutUser = () => api.post("/auth/logout");

export const getCurrentUser = () => api.get("/auth/me");

export const forgotPassword = (payload) => api.post("/auth/forgot-password", payload);

export const resetPassword = ({ token, ...payload }) =>
  api.post(`/auth/reset-password/${token}`, payload);

export default {
  signupUser,
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
