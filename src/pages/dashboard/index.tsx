import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  useUserArticles,
  useDeleteArticle,
} from "@/lib/services/articles/queries";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GetServerSideProps } from "next";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";
import { showErrorToast, showSuccessToast } from "@/lib/hooks/use-toast";

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  // Use Tanstack Query for fetching articles with staleTime set to 0 to ensure refetching
  const {
    data: articlesData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useUserArticles(
    {
      page: currentPage,
      limit: 3,
    },
    {
      staleTime: 0, // This ensures data is always considered stale and will be refetched
      refetchOnMount: "always", // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window regains focus
    }
  );

  // Force refetch when component mounts or when page changes
  useEffect(() => {
    const fetchData = async () => {
      setIsNavigating(true);
      await refetch();
      setIsNavigating(false);
    };

    fetchData();
  }, [refetch, currentPage]);

  // Initialize the delete mutation
  const deleteArticleMutation = useDeleteArticle({
    onSuccess: async () => {
      showSuccessToast("Article deleted successfully!");

      // Refetch to get updated articles count
      const updatedData = await refetch();

      // Check if current page is now empty and it's not the first page
      const updatedArticles = updatedData.data?.articles || [];

      if (updatedArticles.length === 0 && currentPage > 1) {
        // Navigate to the previous page if the current page is now empty
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });

  // Handle article deletion
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate(id);
    }
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Get articles from the data
  const articles = articlesData?.articles || [];
  const totalPages = articlesData?.metadata.totalPages || 1;

  // Auto-correct current page if it exceeds total pages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Define breadcrumbs
  const breadcrumbItems = [{ label: "Dashboard" }];

  // Combine loading states
  const showLoading =
    isLoading || isFetching || isNavigating || deleteArticleMutation.isPending;

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
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-[#EFEBE9]">
                  {articles.map((article) => (
                    <li key={article.id} className="relative">
                      <Link
                        href={`/dashboard/articles/${article.id}`}
                        className="block hover:bg-[#EFEBE9] transition-colors pr-20"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex">
                            {article.coverImage ? (
                              <div className="flex-shrink-0 mr-4">
                                <img
                                  src={article.coverImage}
                                  alt={article.title}
                                  className="h-16 w-16 object-cover rounded-md"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 mr-4">
                                <div className="h-16 w-16 bg-[#EFEBE9] rounded-md flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-[#8D6E63]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-[#5D4037] truncate">
                                  {article.title}
                                </h3>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#EFEBE9] text-[#5D4037]">
                                    {new Date(
                                      article.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-[#6D4C41] line-clamp-2 font-medium">
                                  {article.content.substring(0, 150)}
                                  {article.content.length > 150 ? "..." : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
                        <Link
                          href={`/dashboard/articles/${article.id}/edit`}
                          className="bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#5D4037] p-2 rounded-md transition-colors"
                          title="Edit article"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(article.id);
                          }}
                          className="bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] p-2 rounded-md transition-colors"
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
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#D7CCC8] bg-white text-sm font-medium ${
                        currentPage === 1
                          ? "text-[#BDBDBD] cursor-not-allowed"
                          : "text-[#5D4037] hover:bg-[#EFEBE9] cursor-pointer"
                      } transition-colors`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            page === currentPage
                              ? "z-10 bg-[#EFEBE9] border-[#8D6E63] text-[#5D4037]"
                              : "bg-white border-[#D7CCC8] text-[#5D4037] hover:bg-[#EFEBE9] cursor-pointer"
                          } text-sm font-medium transition-colors`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#D7CCC8] bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-[#BDBDBD] cursor-not-allowed"
                          : "text-[#5D4037] hover:bg-[#EFEBE9] cursor-pointer"
                      } transition-colors`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
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

  return {
    props: {},
  };
};
