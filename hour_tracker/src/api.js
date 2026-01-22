import axios from 'axios';

// Create an instance of axios with your backend's base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Automatically attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Handle global errors (like expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns a 401 (Unauthorized), the token might be expired
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/'; // Kick user back to login
    }
    return Promise.reject(error);
  }
);

export default api;