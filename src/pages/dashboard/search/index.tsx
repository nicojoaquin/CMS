import React from "react";
import { useRouter } from "next/router";
import {
  searchArticlesQueryKey,
  useSearchArticles,
} from "@/lib/services/articles/queries";
import { Article } from "@/lib/services/articles/types";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GetServerSideProps } from "next";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";
import ArticlesList from "../components/articles-list";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { searchArticles } from "@/lib/services/articles";

interface SearchResult extends Article {
  isOwner: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const searchQuery = typeof q === "string" ? q : "";

  const {
    data = [] as SearchResult[],
    isLoading,
    error,
    isError,
  } = useSearchArticles(searchQuery);

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
            <ArticlesList articles={data} />
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
  const query = context.query.q as string;

  await queryClient.prefetchQuery({
    queryKey: searchArticlesQueryKey(query),
    queryFn: () => searchArticles(query),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
