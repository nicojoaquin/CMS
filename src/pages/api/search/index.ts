import { serializePopulatedArticle, toWebHeaders } from "@/lib/api/utils";
import { getServerSession } from "@/lib/auth/config";
import { ArticleDocument, PopulatedArticleDocument } from "@/lib/db/types";
import { getDb } from "@/lib/db/utils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession({
    headers: toWebHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { q: query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "Search query is required" });
  }

  const db = await getDb("blog-cms");

  try {
    const articles = await db
      .collection<ArticleDocument>("article")
      .aggregate<PopulatedArticleDocument>([
        {
          $lookup: {
            from: "user",
            localField: "author",
            foreignField: "_id",
            as: "authorData",
          },
        },
        {
          $unwind: "$authorData",
        },
        {
          $match: {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { content: { $regex: query, $options: "i" } },
              { "authorData.name": { $regex: query, $options: "i" } },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    // Serialize articles and add isOwner flag
    const results = articles.map((article) => {
      const serialized = serializePopulatedArticle(article);

      // Add the isOwner property based on comparing user IDs
      const isOwner =
        article._id && session.user.id === article.authorData._id.toString();

      return {
        ...serialized,
        isOwner,
      };
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error searching articles:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
