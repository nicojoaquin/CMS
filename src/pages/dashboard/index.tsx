import Link from "next/link";
import {
  articlesQueryKey,
  useUserArticles,
} from "@/lib/services/articles/queries";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GetServerSideProps } from "next";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";
import ArticlesList from "./components/articles-list";
import { usePage } from "@/lib/hooks/use-page";
import Pagination from "./components/pagination";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getUserArticles } from "@/lib/services/articles";

const PAGE_LIMIT = 3;

export default function DashboardPage() {
  const { currentPage } = usePage();

  const {
    data: articlesData,
    isLoading,
    error,
  } = useUserArticles({
    page: currentPage,
    limit: PAGE_LIMIT,
  });

  const articles = articlesData?.articles || [];
  const totalPages = articlesData?.metadata.totalPages || 1;

  const breadcrumbItems = [{ label: "Dashboard" }];
  const showLoading = isLoading;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#3E2723] mb-4 sm:mb-0">
              Your Articles
            </h2>

            <div className="w-full sm:w-auto flex justify-between sm:justify-end space-x-4">
              <Link
                href="/dashboard/articles/new"
                className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Article
              </Link>
            </div>
          </div>
          {showLoading ? (
            <div className="flex justify-center py-8">
              <div className="loader text-[#5D4037]">Loading...</div>
            </div>
          ) : error ? (
            <div className="bg-[#FFEBEE] text-[#B71C1C] p-4 rounded-md font-medium">
              {(error as Error).message || "Error loading articles"}
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
              <p className="text-[#5D4037] font-medium">
                You haven&apos;t created any articles yet.
              </p>
              <Link
                href="/dashboard/articles/new"
                className="mt-4 inline-block bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                Create your first article
              </Link>
            </div>
          ) : (
            <>
              <ArticlesList articles={articles} />
              {totalPages > 1 && <Pagination totalPages={totalPages} />}
            </>
          )}
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
  const page = parseInt(context.query.page as string) || 1;

  await queryClient.prefetchQuery({
    queryKey: articlesQueryKey(page),
    queryFn: () => getUserArticles({ page, limit: PAGE_LIMIT }),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
