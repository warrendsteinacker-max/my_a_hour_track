import axios from 'axios';

/**
 * 1. TAILSCALE DYNAMIC BASE URL
 * Prioritizes the .env variable, then your Desktop's Tailscale IP [cite: 2026-01-24].
 */
const TAILSCALE_IP = "100.103.196.73"; 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${TAILSCALE_IP}:5000/api`,
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
    // A. NETWORK ERROR (Tailscale is off or Server is down) [cite: 2026-01-24]
    if (!error.response) {
      window.dispatchEvent(new CustomEvent('architect-system-error', { 
        detail: "Something went wrong contact me at 231-878-0753" 
      }));
      console.error("CRITICAL: Tailscale connection lost or PM2 process down.");
    }

    // B. AUTHENTICATION ERROR (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('hour_track_user');
      window.location.href = '/'; 
    }

    return Promise.reject(error);
  }
);

export default api;