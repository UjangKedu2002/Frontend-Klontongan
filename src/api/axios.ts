import axios from "axios";

// Permitted to fall back to direct address if env is empty, and allows runtime UI configuration for testing flexibility!
const getBaseURL = () => {
  const savedURL = localStorage.getItem("VITE_API_URL_OVERRIDE");
  if (savedURL) return savedURL;
  return (
    (import.meta as any).env.VITE_API_URL ||
    "https://backend-klontongan-production.up.railway.app/api"
  );
};

const api = axios.create({
  get baseURL() {
    return getBaseURL();
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
