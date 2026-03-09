import axios, { AxiosError } from 'axios';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for httpOnly tokens and CSRF
});

// Store CSRF token
let csrfToken: string | null = null;

// Fetch CSRF token on app initialization
export const initializeCsrf = async () => {
  try {
    const response = await axios.get(`${API_URL}/csrf-token`, {
      withCredentials: true
    });
    csrfToken = response.data.csrfToken;
    console.log('CSRF token initialized');
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

// Request interceptor to add CSRF token
api.interceptors.request.use(
  (config) => {
    // Add CSRF token for state-changing requests
    if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and CSRF errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      // Refresh CSRF token and retry
      await initializeCsrf();
      if (csrfToken && originalRequest) {
        originalRequest.headers['X-CSRF-Token'] = csrfToken;
        return api(originalRequest);
      }
    }

    // Handle token expiration - refresh token automatically
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (token is in httpOnly cookie)
        await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
          headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
        });

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
