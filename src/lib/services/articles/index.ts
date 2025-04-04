import { apiClient } from "../axios";
import {
  CreateArticleRequest,
  CreateArticleResponse,
  GetArticleByIdResponse,
  GetArticlesResponse,
  SearchArticlesResponse,
  UpdateArticleRequest,
  UpdateArticleResponse,
} from "./types";

const ENDPOINT = "/articles";

export async function getUserArticles(options?: {
  page?: number;
  limit?: number;
}): Promise<GetArticlesResponse> {
  try {
    const { data } = await apiClient.get<GetArticlesResponse>(ENDPOINT, {
      params: {
        page: options?.page || 1,
        limit: options?.limit || 10,
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching user articles:", error);
    throw error;
  }
}

export async function getArticleById(
  id: string
): Promise<GetArticleByIdResponse> {
  try {
    const { data } = await apiClient.get<GetArticleByIdResponse>(
      `${ENDPOINT}/${id}`
    );
    return data;
  } catch (error) {
    throw error;
  }
}

export async function createArticle(
  dto: CreateArticleRequest
): Promise<CreateArticleResponse> {
  try {
    const { data } = await apiClient.post<CreateArticleResponse>(ENDPOINT, dto);
    return data;
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
}

export async function searchArticles(
  query: string
): Promise<SearchArticlesResponse> {
  try {
    const { data } = await apiClient.get<SearchArticlesResponse>("/search", {
      params: { q: query },
    });
    return data;
  } catch (error) {
    console.error(`Error searching articles with query "${query}":`, error);
    throw error;
  }
}

export async function updateArticle(
  id: string,
  dto: UpdateArticleRequest
): Promise<UpdateArticleResponse> {
  try {
    const { data } = await apiClient.put<UpdateArticleResponse>(
      `${ENDPOINT}/${id}`,
      dto
    );
    return data;
  } catch (error) {
    console.error(`Error updating article ${id}:`, error);
    throw error;
  }
}

export async function deleteArticle(id: string): Promise<void> {
  try {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting article ${id}:`, error);
    throw error;
  }
}
