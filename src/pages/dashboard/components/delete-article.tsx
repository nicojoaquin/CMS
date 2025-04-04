import { usePage } from "@/lib/hooks/use-page";
import { showErrorToast, showSuccessToast } from "@/lib/hooks/use-toast";
import {
  articlesQueryKey,
  useDeleteArticle,
} from "@/lib/services/articles/queries";
import { Article, GetArticlesResponse } from "@/lib/services/articles/types";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  article: Article;
};

const DeleteArticle = ({ article }: Props) => {
  const queryClient = useQueryClient();
  const { currentPage, setCurrentPage } = usePage();

  const deleteArticleMutation = useDeleteArticle({
    onSuccess: async (_, id) => {
      console.log("id");

      const prevArticlesResponse =
        queryClient.getQueryData<GetArticlesResponse>([
          articlesQueryKey(currentPage),
        ]);

      const newArticles =
        prevArticlesResponse?.articles?.filter(
          (article) => article.id !== id
        ) ?? [];

      if (newArticles.length === 0 && currentPage > 1)
        setCurrentPage(currentPage - 1);

      showSuccessToast("Article deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutateAsync(id);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDelete(article.id);
      }}
      className="bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] p-2 rounded-md transition-colors cursor-pointer "
      title="Delete article"
      disabled={deleteArticleMutation.isPending}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
};

export default DeleteArticle;
