import axios, { AxiosError } from 'axios';

const API_URL = ((import.meta as any).env.VITE_API_URL as string) || 'http://localhost:5000/api';

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
    
    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
    if (error.response?.status === 403 && (error.response?.data as any)?.message?.includes('CSRF')) {
      // Refresh CSRF token and retry
      await initializeCsrf();
      if (csrfToken && originalRequest) {
        originalRequest.headers['X-CSRF-Token'] = csrfToken;
        return api(originalRequest);
      }
    }

    // Don't try to refresh token for auth endpoints (login, register, verify-otp)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                          originalRequest?.url?.includes('/auth/register') ||
                          originalRequest?.url?.includes('/auth/verify-otp');

    // Handle token expiration - refresh token automatically (but not for auth endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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
