import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSearchArticles } from "@/lib/services/articles/queries";
import { Article } from "@/lib/services/articles/types";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GetServerSideProps } from "next";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";

// Extend the Article type to include the isOwner property
interface SearchResult extends Article {
  isOwner: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const searchQuery = typeof q === "string" ? q : "";

  // Use Tanstack Query for searching
  const {
    data = [] as SearchResult[],
    isLoading,
    error,
    isError,
  } = useSearchArticles(searchQuery);

  // Define breadcrumbs
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Search Results" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />

          <h2 className="text-2xl font-semibold text-[#3E2723] mb-6">
            Search Results
          </h2>

          {searchQuery && (
            <div className="mb-4 text-sm text-[#5D4037] font-medium">
              Showing results for:{" "}
              <span className="font-semibold">&quot;{searchQuery}&quot;</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="loader text-[#5D4037]">Loading...</div>
            </div>
          ) : isError ? (
            <div className="bg-[#FFEBEE] text-[#B71C1C] p-4 rounded-md font-medium">
              {(error as Error).message || "Failed to search articles"}
            </div>
          ) : data.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
              <p className="text-[#5D4037] font-medium">
                {searchQuery
                  ? "No articles found matching your search."
                  : "Enter a search term in the header to find articles."}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-[#EFEBE9]">
                {data.map((article) => (
                  <li key={article.id}>
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
                              {article.isOwner ? (
                                <Link
                                  href={`/dashboard/articles/${article.id}`}
                                  className="hover:underline cursor-pointer"
                                >
                                  {article.title}
                                </Link>
                              ) : (
                                article.title
                              )}
                            </h3>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#EFEBE9] text-[#5D4037]">
                                {new Date(
                                  article.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-[#5D4037] font-medium">
                                By {article.author.name}
                              </p>
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
                  </li>
                ))}
              </ul>
            </div>
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
