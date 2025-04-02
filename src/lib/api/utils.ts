import { IncomingHttpHeaders } from "http";
import { PopulatedArticleDocument } from "@/lib/db/types";
import { Article } from "@/lib/services/articles/types";

export function serializePopulatedArticle(
  article: PopulatedArticleDocument
): Article {
  return {
    id: article._id.toString(),
    title: article.title,
    content: article.content,
    coverImage: article.coverImage,
    author: {
      id: article.authorData._id.toString(),
      name: article.authorData.name,
    },
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt?.toISOString(),
  };
}

export function toWebHeaders(headers: IncomingHttpHeaders): Headers {
  const webHeaders = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      webHeaders.append(key, value);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        webHeaders.append(key, v);
      }
    }
  }

  return webHeaders;
}
