import axios from 'axios';

// 1. DYNAMIC BASE URL: 
// It prioritizes your .env (Tailscale IP) but falls back to the current hostname
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. REQUEST INTERCEPTOR: Attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR: Handle Global Errors & Tailscale Connection Drops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A. NETWORK ERROR (Tailscale is off or Server is down)
    if (!error.response) {
      // We dispatch a custom event that your StatusBar.jsx can listen to
      // to display: "Something went wrong contact me at 231-878-0753"
      window.dispatchEvent(new CustomEvent('architect-system-error', { 
        detail: "System Unreachable" 
      }));
      console.error("CRITICAL: Tailscale connection lost or PM2 process down.");
    }

    // B. AUTHENTICATION ERROR (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('hour_track_user');
      window.location.href = '/'; // Kick back to login
    }

    return Promise.reject(error);
  }
);

export default api;