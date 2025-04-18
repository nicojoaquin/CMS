import { useRouter } from "next/router";
import Link from "next/link";
import {
  articleQueryKey,
  useArticleById,
  useDeleteArticle,
} from "@/lib/services/articles/queries";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GetServerSideProps } from "next";
import { showErrorToast, showSuccessToast } from "@/lib/hooks/use-toast";
import { authClient } from "@/lib/auth/client";
import { getArticleById } from "@/lib/services/articles";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import Image from "next/image";
import GetArticleError from "../../../components/articles/get-article-error";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = authClient.useSession();
  const { data: article, isLoading, error } = useArticleById(id as string);

  const isOwner = article?.author?.id === session?.user?.id;

  const deleteArticleMutation = useDeleteArticle({
    onSuccess: () => {
      showSuccessToast("Article deleted successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });

  const handleDelete = () => {
    if (!isOwner) {
      showErrorToast("You don't have permission to delete this article");
      return;
    }

    if (confirm("Are you sure you want to delete this article?"))
      deleteArticleMutation.mutate(id as string);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center">
        <div className="loader text-[#5D4037]">Loading...</div>
      </div>
    );
  }

  if (error) return <GetArticleError message={(error as Error).message} />;
  if (!article) return <GetArticleError message="Article Not Found" />;

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: article.title },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          {isOwner && (
            <div className="flex justify-end space-x-4 mb-6">
              <Link
                href={`/dashboard/articles/${article.id}/edit`}
                className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                Edit Article
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteArticleMutation.isPending}
                className={`bg-[#C62828] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  deleteArticleMutation.isPending
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#B71C1C] cursor-pointer"
                }`}
              >
                {deleteArticleMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-semibold text-[#3E2723] mb-4">
                  {article.title}
                </h1>
                <span className="px-3 py-1 text-sm bg-[#EFEBE9] text-[#5D4037] rounded-full font-medium">
                  {new Date(article.createdAt).toLocaleDateString()} at{" "}
                  {new Date(article.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <span className="h-10 w-10 rounded-full bg-[#D7CCC8] flex items-center justify-center text-[#5D4037] font-bold">
                    {article.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#5D4037]">
                    {article.author.name}
                  </p>
                  {isOwner && (
                    <p className="text-xs text-[#8D6E63]">
                      You are the author of this article
                    </p>
                  )}
                </div>
              </div>

              {article.coverImage && (
                <div className="mb-6">
                  <Image
                    width={500}
                    height={200}
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}

              <div className="prose prose-[#5D4037] prose-lg max-w-none">
                {article.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 text-[#3E2723] font-medium">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession({
    headers: toWebHeaders(context.req.headers),
  });

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient();
  const id = context.params?.id as string;

  try {
    await queryClient.prefetchQuery({
      queryKey: articleQueryKey(id),
      queryFn: () => getArticleById(id),
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  } catch (_error) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }
};
