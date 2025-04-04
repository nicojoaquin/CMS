import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getUserArticles,
  getArticleById,
  createArticle,
  searchArticles,
  updateArticle,
  deleteArticle,
} from "./index";
import { CreateArticleRequest, UpdateArticleRequest, Article } from "./types";

type ArticleContext = {
  previousArticle?: Article;
};

type DeleteArticleContext = {
  previousArticles?: Article[];
  articleToDelete?: Article;
};

export const articlesQueryKey = (page: number) => ["articles", page];
export const articleQueryKey = (id: string) => ["article", id];
export const searchArticlesQueryKey = (query: string) => ["search", query];
export const ARTICLES_QUERY_KEY = ["articles"];

export function useUserArticles(
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 10 } = options;

  return useQuery({
    queryKey: articlesQueryKey(page),
    queryFn: () => getUserArticles({ page, limit }),
  });
}

export function useArticleById(id: string | undefined) {
  return useQuery({
    queryKey: articleQueryKey(id!),
    queryFn: () => getArticleById(id as string),
    enabled: !!id,
  });
}

export function useSearchArticles(query: string | undefined) {
  return useQuery({
    queryKey: searchArticlesQueryKey(query!),
    queryFn: async () => {
      if (!query || query.trim() === "") {
        return [];
      }
      return await searchArticles(query);
    },
    enabled: !!query && query.trim().length > 0,
  });
}

export function useCreateArticle(
  mutationOptions?: Omit<
    UseMutationOptions<Article, Error, CreateArticleRequest, unknown>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Article, Error, CreateArticleRequest, unknown>({
    mutationFn: createArticle,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ARTICLES_QUERY_KEY,
        refetchType: "all",
      });
      queryClient.setQueryData(["article", data.id], data);
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
  });
}

export function useUpdateArticle(
  id: string,
  mutationOptions?: Omit<
    UseMutationOptions<Article, Error, UpdateArticleRequest, ArticleContext>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Article, Error, UpdateArticleRequest, ArticleContext>({
    mutationFn: (articleData: UpdateArticleRequest) =>
      updateArticle(id, articleData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: articleQueryKey(id),
        refetchType: "all",
      });

      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },

    onError: (error, variables, context) => {
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
  });
}

export function useDeleteArticle(
  mutationOptions?: Omit<
    UseMutationOptions<void, Error, string, DeleteArticleContext>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, DeleteArticleContext>({
    mutationFn: deleteArticle,
    onSuccess: (_, id, context) => {
      queryClient.invalidateQueries({
        queryKey: ARTICLES_QUERY_KEY,
        refetchType: "all",
      });

      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(_, id, context);
      }
    },

    onError: (error, id, context) => {
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, id, context);
      }
    },
  });
}
