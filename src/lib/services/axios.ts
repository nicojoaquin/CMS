import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
});

export const apiClient = {
  get: <T = unknown>(
    route: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.get<T>(route, {
      signal: config?.signal,
      params: config?.params,
    }),

  post: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.post<T>(route, data, {
      signal: config?.signal,
    }),

  put: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.put<T>(route, data, {
      signal: config?.signal,
    }),

  patch: <T = unknown, D = unknown>(
    route: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    api.patch<T>(route, data, {
      signal: config?.signal,
    }),
};
