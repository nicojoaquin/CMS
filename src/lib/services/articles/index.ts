import { apiClient } from "../axios";
import {
  Article,
  CreateArticleRequest,
  GetArticlesResponse,
  UpdateArticleRequest,
} from "./types";

const ENDPOINT = "/articles";

/**
 * Fetches articles with pagination
 */
export async function getUserArticles(options?: {
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<GetArticlesResponse> {
  try {
    const { data } = await apiClient.get<GetArticlesResponse>(ENDPOINT, {
      params: {
        page: options?.page || 1,
        limit: options?.limit || 10,
      },
      signal: options?.signal,
    });
    return data;
  } catch (error) {
    console.error("Error fetching user articles:", error);
    throw error;
  }
}

/**
 * Fetches a single article by ID
 */
export async function getArticleById(
  id: string,
  signal?: AbortSignal
): Promise<Article> {
  try {
    const { data } = await apiClient.get<Article>(`${ENDPOINT}/${id}`, {
      signal,
    });
    return data;
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    throw error;
  }
}

/**
 * Creates a new article
 */
export async function createArticle(
  dto: CreateArticleRequest
): Promise<Article> {
  try {
    const { data } = await apiClient.post<Article>(ENDPOINT, dto);
    return data;
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
}

/**
 * Searches for articles by query term
 */
export async function searchArticles(
  query: string,
  signal?: AbortSignal
): Promise<Article[]> {
  try {
    const { data } = await apiClient.get<Article[]>("/search", {
      params: { q: query },
      signal,
    });
    return data;
  } catch (error) {
    console.error(`Error searching articles with query "${query}":`, error);
    throw error;
  }
}

/**
 * Updates an existing article
 */
export async function updateArticle(
  id: string,
  dto: UpdateArticleRequest
): Promise<Article> {
  try {
    const { data } = await apiClient.put<Article>(`${ENDPOINT}/${id}`, dto);
    return data;
  } catch (error) {
    console.error(`Error updating article ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes an article by ID
 */
export async function deleteArticle(id: string): Promise<void> {
  try {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting article ${id}:`, error);
    throw error;
  }
}
