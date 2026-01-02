import axios from 'axios';
import { API_BASE_URL } from "./BaseUrl.jsx";
import { AUTH_LOGIN_PATH, AUTH_REFRESH_TOKEN_PATH } from "./ConstAPI.jsx";
import { clearAuth, getRefreshToken, getAuth, setAuth, setRefreshToken } from "../auth/authStorage.js";

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function readTimeoutMs(fallback = 15000) {
  const raw = import.meta.env.VITE_API_TIMEOUT_MS;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// Axios Instance with Interceptors

// Create Axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: readTimeoutMs(),
  headers: {
    'Content-Type': 'application/json',
  },
});


let isRefreshing = false;
let refreshSubscribers = []; // Queue of callbacks to retry failed requests

/**
 * Add a request to the retry queue
 * @param {Function} callback - Function to call after token refresh (token, error)
 */
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

/**
 * Execute all queued requests after successful token refresh
 * @param {string} token - New access token
 */
function onRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token, null));
  refreshSubscribers = []; // Clear the queue
}

/**
 * Handle failed refresh - notify all subscribers of failure
 * @param {Error} error - Refresh error
 */
function onRefreshFailed(error) {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
}

// Request Interceptor - Automatically Attach Token
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token attachment for auth endpoints (login, refresh)
    const isAuthEndpoint = config.url?.includes(AUTH_LOGIN_PATH) ||
      config.url?.includes(AUTH_REFRESH_TOKEN_PATH);

    if (!isAuthEndpoint) {
      // Get current access token from storage
      const { token } = getAuth();

      if (token) {
        // Automatically attach Bearer token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle 401 & Token Refresh
axiosInstance.interceptors.response.use(
  // Success response - pass through
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes(AUTH_LOGIN_PATH) ||
        originalRequest.url?.includes(AUTH_REFRESH_TOKEN_PATH);

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Mark this request to prevent retry loops
      originalRequest._retry = true;

      // Get refresh token from storage
      const refreshToken = getRefreshToken();

      // If no refresh token, clear auth and redirect to login
      if (!refreshToken) {
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(new ApiError('No refresh token available. Please login again.', { status: 401 }));
      }

      // If refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          // Subscribe to token refresh completion
          subscribeTokenRefresh((token, refreshError) => {
            if (refreshError || !token) {
              reject(refreshError || new ApiError('Token refresh failed.', { status: 401 }));
              return;
            }

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      // Start token refresh process
      isRefreshing = true;

      try {
        // Call refresh token API directly with axios (bypass interceptor)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}${AUTH_REFRESH_TOKEN_PATH}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
            timeout: readTimeoutMs(),
          }
        );

        // Extract new tokens from response (handle different response structures)
        const newAccessToken = refreshResponse?.data?.data?.access_token ||
          refreshResponse?.data?.access_token;
        const newRefreshToken = refreshResponse?.data?.data?.refresh_token ||
          refreshResponse?.data?.refresh_token;

        if (!newAccessToken) {
          throw new Error('Refresh token response missing access_token');
        }

        // Save new tokens to localStorage
        const { user } = getAuth();
        setAuth({ token: newAccessToken, user });

        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        // Update Authorization header for retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Notify all queued requests that refresh succeeded
        onRefreshed(newAccessToken);

        // Retry the original failed request
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Token refresh failed - clear auth and redirect
        clearAuth();

        // Notify all queued requests that refresh failed
        onRefreshFailed(refreshError);

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }

        return Promise.reject(
          new ApiError('Session expired. Please login again.', { status: 401 })
        );
      } finally {
        // Reset refreshing flag
        isRefreshing = false;
      }
    }

    // For non-401 errors, reject normally
    return Promise.reject(error);
  }
);

/**
 * Make an API request using Axios
 * Automatically attaches token and handles 401 with refresh
 * 
 * @param {string} path - API endpoint path
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {Object} options.headers - Custom headers
 * @param {*} options.body - Request body (raw)
 * @param {Object} options.json - JSON body (will be stringified)
 * @param {number} options.timeoutMs - Request timeout
 * @param {AbortSignal} options.signal - Abort signal
 * @returns {Promise} Response data
 */
export async function apiJson(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    json,
    timeoutMs,
    signal,
  } = options;

  try {
    // Prepare request config
    const config = {
      method: method.toLowerCase(),
      url: path,
      headers: { ...headers },
      timeout: timeoutMs || readTimeoutMs(),
    };

    // Handle request body
    if (json !== undefined) {
      config.data = json;
    } else if (body !== undefined) {
      config.data = body;
    }

    // Handle AbortSignal
    if (signal) {
      config.signal = signal;
    }

    // Make request using Axios instance (interceptors handle token & refresh)
    const response = await axiosInstance(config);

    // Return response data
    return response.data;

  } catch (error) {
    // Axios error handling - convert to ApiError
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      const message = (data && typeof data === 'object' && (data.message || data.error)) ||
        `Request failed (${status})`;

      throw new ApiError(message, { status, data });
    } else if (error.request) {
      // Request made but no response received
      throw new ApiError('Network error. Please check your connection.', { status: 0 });
    } else {
      // Error in request setup
      throw new ApiError(error.message || 'Request failed', { status: 0 });
    }
  }
}

export { axiosInstance };


