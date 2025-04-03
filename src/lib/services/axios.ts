import Axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
} from "axios";

// Create axios instance with default config
const api: AxiosInstance = Axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Default timeout of 30 seconds
});

// Add request interceptor for authentication tokens, etc.
api.interceptors.request.use(
  (config) => {
    // You can add auth token or other headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors here (e.g., 401 Unauthorized, 403 Forbidden)
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      console.error("Unauthorized access - not logged in");
    } else if (error.response?.status === 403) {
      console.error("Forbidden access - no permission");
    } else if (error.response?.status === 500) {
      console.error("Server error:", error.message);
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
    }

    return Promise.reject(error);
  }
);

// Type-safe API client with consistent methods
export const apiClient = {
  /**
   * HTTP GET request
   */
  get: <T = unknown>(
    route: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.get<T>(route, {
      signal: config?.signal,
      params: config?.params,
      headers: config?.headers,
    }),

  /**
   * HTTP POST request
   */
  post: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.post<T>(route, data, {
      signal: config?.signal,
      headers: config?.headers,
    }),

  /**
   * HTTP PUT request
   */
  put: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.put<T>(route, data, {
      signal: config?.signal,
      headers: config?.headers,
    }),

  /**
   * HTTP PATCH request
   */
  patch: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.patch<T>(route, data, {
      signal: config?.signal,
      headers: config?.headers,
    }),

  /**
   * HTTP DELETE request
   */
  delete: <T = unknown>(
    route: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.delete<T>(route, {
      signal: config?.signal,
      params: config?.params,
      headers: config?.headers,
    }),
};
