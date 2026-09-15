import axios from "axios";

const viteApiUrl =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_API_URL : undefined;

// Create an Axios instance with the base URL and default headers
const api = axios.create({
  baseURL: (viteApiUrl || "http://localhost:5000/api").replace(/\/$/, ""),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request and response interceptors
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;