import { AxiosRequestConfig } from "axios";
import { apiClient } from "../../services/axios";
import { CreateArticleRequest } from "./types";

const ENDPOINT = "/article";

export async function getIssues(page: string, options: AxiosRequestConfig) {
  const { data } = await apiClient.get(ENDPOINT, {
    params: { page },
    signal: options?.signal,
  });
  return data;
}

export async function createArticle(dto: CreateArticleRequest) {
  const { data } = await apiClient.post<unknown, CreateArticleRequest>(
    ENDPOINT,
    dto
  );
  return data;
}
