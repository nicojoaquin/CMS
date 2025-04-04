import Axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
} from "axios";

const api: AxiosInstance = Axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
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

export const apiClient = {
  get: <T = unknown>(
    route: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.get<T>(route, {
      signal: config?.signal,
      params: config?.params,
      headers: config?.headers,
    }),
  post: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.post<T>(route, data, {
      signal: config?.signal,
      headers: config?.headers,
    }),
  put: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.put<T>(route, data, {
      signal: config?.signal,
      headers: config?.headers,
    }),
  patch: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.patch<T>(route, data, {
      signal: config?.signal,
      headers: config?.headers,
    }),
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
