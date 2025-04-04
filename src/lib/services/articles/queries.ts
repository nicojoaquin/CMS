import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import {
  getUserArticles,
  getArticleById,
  createArticle,
  searchArticles,
  updateArticle,
  deleteArticle,
} from "./index";
import {
  CreateArticleRequest,
  UpdateArticleRequest,
  GetArticlesResponse,
  Article,
} from "./types";

// Enhanced Article type with isOwner property
export interface SearchResultItem extends Article {
  isOwner: boolean;
}

// Type for optimistic update context
interface ArticleContext {
  previousArticle?: Article;
}

interface DeleteArticleContext {
  previousArticles?: unknown;
  articleToDelete?: Article;
}

/**
 * Hook for fetching articles with pagination, with strongly typed options
 */
export function useUserArticles(
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 10 } = options;

  return useQuery({
    queryKey: ["articles", page],
    queryFn: () => getUserArticles({ page, limit }),
  });
}

/**
 * Hook for fetching a single article by ID, with strongly typed options
 */
export function useArticleById(
  id: string | undefined,
  queryOptions?: Omit<
    UseQueryOptions<Article, Error, Article, QueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >
) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => getArticleById(id as string),
    enabled: !!id, // Only run the query if we have an ID
    ...queryOptions,
  });
}

/**
 * Hook for searching articles, with strongly typed options
 */
export function useSearchArticles(
  query: string | undefined,
  queryOptions?: Omit<
    UseQueryOptions<SearchResultItem[], Error, SearchResultItem[], QueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >
) {
  return useQuery<SearchResultItem[]>({
    queryKey: ["search", query],
    queryFn: async () => {
      // Return empty array if query is empty
      if (!query || query.trim() === "") {
        return [];
      }

      try {
        // Since the API already returns the isOwner field but TypeScript doesn't know
        // about it based on the Article type, we need to assert the type
        const result = await searchArticles(query);
        return result as unknown as SearchResultItem[];
      } catch (error) {
        console.error("Search error:", error);
        throw error;
      }
    },
    enabled: !!query && query.trim().length > 0, // Only run if we have a non-empty query
    ...queryOptions,
  });
}

/**
 * Hook for creating a new article, with optimistic updates and strongly typed options
 */
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
      // First invalidate all article queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["articles"],
        refetchType: "all", // Force refetch all queries
      });

      // Now specifically update the article list for immediate feedback
      queryClient.setQueriesData({ queryKey: ["articles"] }, (old) => {
        if (!old || typeof old !== "object" || !("articles" in old)) return old;

        const typedOld = old as GetArticlesResponse;

        // Check if the article already exists in the list (avoid duplicates)
        const articleExists = typedOld.articles.some(
          (article) => article.id === data.id
        );

        if (articleExists) {
          return typedOld;
        }

        return {
          ...typedOld,
          articles: [data, ...typedOld.articles],
          metadata: {
            ...typedOld.metadata,
            total: typedOld.metadata.total + 1,
          },
        };
      });

      // Set the individual article data in the cache
      queryClient.setQueryData(["article", data.id], data);

      // Immediately refetch the article list to ensure it's up to date
      queryClient.refetchQueries({ queryKey: ["articles"] });

      // If the mutation provides onSuccess handler, call it
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error("Error creating article:", error);

      // If the mutation provides onError handler, call it
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
}

/**
 * Hook for updating an existing article, with optimistic updates and strongly typed options
 */
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

    onMutate: async (newArticleData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["article", id] });

      // Snapshot the previous value
      const previousArticle = queryClient.getQueryData<Article>([
        "article",
        id,
      ]);

      // Optimistically update to the new value
      if (previousArticle) {
        const optimisticArticle = {
          ...previousArticle,
          ...newArticleData,
          // Make sure updatedAt is set to now for optimistic update
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Article>(["article", id], optimisticArticle);

        // Also update in article lists to ensure UI consistency
        queryClient.setQueriesData({ queryKey: ["articles"] }, (old) => {
          if (!old || typeof old !== "object" || !("articles" in old))
            return old;

          const typedOld = old as GetArticlesResponse;

          return {
            ...typedOld,
            articles: typedOld.articles.map((article) =>
              article.id === id ? optimisticArticle : article
            ),
          };
        });
      }

      // Return a context object with the snapshot
      return { previousArticle };
    },

    onSuccess: (data, variables, context) => {
      console.log(
        "Article updated successfully:",
        data,
        "with variables:",
        variables
      );

      // First invalidate all article queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["articles"],
        refetchType: "all", // Force refetch all queries
      });

      // Set the updated article in the cache with specific focus on the coverImage
      queryClient.setQueryData(["article", id], data);

      // Update the article in any lists it appears in with emphasis on image updates
      queryClient.setQueriesData({ queryKey: ["articles"] }, (old) => {
        if (!old || typeof old !== "object" || !("articles" in old)) return old;

        const typedOld = old as GetArticlesResponse;

        return {
          ...typedOld,
          articles: typedOld.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  ...data,
                  // Ensure coverImage is properly updated if it exists in the data
                  ...(data.coverImage ? { coverImage: data.coverImage } : {}),
                }
              : article
          ),
        };
      });

      // Immediately refetch the article detail to ensure it's up to date
      queryClient.refetchQueries({
        queryKey: ["articles", id],
        type: "all",
      });

      // Also refetch the article list to ensure it's up to date
      queryClient.refetchQueries({
        queryKey: ["articles"],
        type: "all",
      });

      // If the mutation provides onSuccess handler, call it
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },

    onError: (error, variables, context) => {
      console.error("Error updating article:", error);

      // Rollback to the previous value if there's an error
      if (context?.previousArticle) {
        // Restore the article detail
        queryClient.setQueryData(["articles", id], context.previousArticle);

        // Also restore in article lists
        queryClient.setQueriesData({ queryKey: ["articles"] }, (old) => {
          if (!old || typeof old !== "object" || !("articles" in old))
            return old;

          const typedOld = old as GetArticlesResponse;

          return {
            ...typedOld,
            articles: typedOld.articles.map((article) =>
              article.id === id ? context.previousArticle : article
            ),
          };
        });
      }

      // If the mutation provides onError handler, call it
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },

    ...mutationOptions,
  });
}

/**
 * Hook for deleting an article, with optimistic updates and strongly typed options
 */
export function useDeleteArticle(
  mutationOptions?: Omit<
    UseMutationOptions<void, Error, string, DeleteArticleContext>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, DeleteArticleContext>({
    mutationFn: deleteArticle,

    onMutate: async (id) => {
      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["articles"] });

      // Get the current articles list from the cache
      const previousArticles = queryClient.getQueryData(["articles"]);

      // Get the article being deleted for potential rollback
      const articleToDelete = queryClient.getQueryData<Article>([
        "articles",
        id,
      ]);

      // Remove the article from all list queries in the cache
      queryClient.setQueriesData({ queryKey: ["articles"] }, (old) => {
        if (!old || typeof old !== "object" || !("articles" in old)) return old;

        const typedOld = old as GetArticlesResponse;

        return {
          ...typedOld,
          articles: typedOld.articles.filter((article) => article.id !== id),
          metadata: {
            ...typedOld.metadata,
            total: Math.max(0, typedOld.metadata.total - 1),
            totalPages: Math.max(
              1,
              Math.ceil((typedOld.metadata.total - 1) / typedOld.metadata.limit)
            ),
          },
        };
      });

      // Remove the article from the cache
      queryClient.removeQueries({ queryKey: ["articles", id] });

      return { previousArticles, articleToDelete };
    },

    onSuccess: (_, id, context) => {
      // Invalidate all article queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["articles"],
        refetchType: "all",
      });

      // Force immediate refetch to update pagination info
      queryClient.refetchQueries({
        queryKey: ["articles"],
        type: "all",
      });

      // If the mutation provides onSuccess handler, call it
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(_, id, context);
      }
    },

    onError: (error, id, context) => {
      console.error("Error deleting article:", error);

      // Restore any affected queries from the context
      if (context?.previousArticles) {
        queryClient.setQueriesData(
          { queryKey: ["articles"] },
          context.previousArticles
        );
      }

      if (context?.articleToDelete) {
        queryClient.setQueryData(["articles", id], context.articleToDelete);
      }

      // If the mutation provides onError handler, call it
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, id, context);
      }
    },

    ...mutationOptions,
  });
}
