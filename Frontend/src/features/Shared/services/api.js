import axios from "axios";

const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
     withCredentials: true, // sends cookies (accessToken + refreshToken)
     headers: {
          "Content-Type": "application/json",
     },
})

// REQUEST INTERCEPTOR
api.interceptors.request.use(
     (config) => {
          return config;
     },
     (error) => {
          return Promise.reject(error);
     }
);

// RESPONSE INTERCEPTOR

api.interceptors.response.use(
     (response) => response,
     async (error) => {
          const originalRequest = error.config;

          // If access token expired → try refresh
          if (error.response.status === 401 && !originalRequest._retry){
               originalRequest._retry = true
               try {
                    // Call refresh endpoint (cookies are sent automatically)
                    await api.post("/auth/refresh")
                    // Retry the original request
                    return api(originalRequest);
               } catch (refreshError) {
                    // Refresh also failed -> redirect to login
                    if (window.location.pathname !== "/login"){
                         window.location.href = "/login";
                    }
                    return Promise.reject(refreshError);
               }
          }
          return Promise.reject(error);
     }
)
export default api