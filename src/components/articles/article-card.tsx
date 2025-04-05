import { Article, SearchArticleItem } from "@/lib/services/articles/types";
import Image from "next/image";
import Link from "next/link";
import DeleteArticle from "./delete-article";
import { authClient } from "@/lib/auth/client";

type Props = SearchArticleItem | Article;

const ArticleCard = (article: Props) => {
  const { data } = authClient.useSession();
  const isOwner = article.author.id === data?.user.id;

  const isSearchArticle = "isOwner" in article;

  const content = (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex">
        {article.coverImage ? (
          <div className="flex-shrink-0 mr-4">
            <Image
              width={64}
              height={64}
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
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p className="text-sm text-[#8D6E63] font-medium mt-1">
            By {article.author?.name || "Unknown Author"}
          </p>
          <div className="mt-2">
            <p className="text-sm text-[#6D4C41] line-clamp-2 font-medium">
              {article.content.substring(0, 150)}
              {article.content.length > 150 ? "..." : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <li className="relative">
      {isOwner ? (
        <Link
          href={`/dashboard/articles/${article.id}`}
          className="block hover:bg-[#EFEBE9] transition-colors pr-20"
        >
          {content}
        </Link>
      ) : (
        <div className="block pr-20">{content}</div>
      )}

      {!isSearchArticle && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
          <DeleteArticle article={article} />
        </div>
      )}
    </li>
  );
};

export default ArticleCard;
