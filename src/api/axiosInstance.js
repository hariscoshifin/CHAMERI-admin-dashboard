import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 60000, // 60s — needed for Cloudinary image uploads
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("chameri_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("chameri_token");
      localStorage.removeItem("chameri_admin");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
