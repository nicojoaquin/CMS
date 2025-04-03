import { Article } from "@/lib/services/articles/types";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "../../../lib/auth/config";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/db/utils";
import { ArticleDocument, PopulatedArticleDocument } from "@/lib/db/types";
import { serializePopulatedArticle, toWebHeaders } from "@/lib/api/utils";
import { createArticleSchema } from "@/lib/api/schemas";

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

  const db = await getDb("blog-cms");

  if (req.method === "GET") {
    try {
      // Parse pagination parameters
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Get the total count of articles for this user
      const totalCount = await db
        .collection<ArticleDocument>("article")
        .countDocuments({ author: new ObjectId(session.user.id) });

      // Get paginated articles
      const articles = await db
        .collection<ArticleDocument>("article")
        .aggregate<PopulatedArticleDocument>([
          {
            $match: { author: new ObjectId(session.user.id) },
          },
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
            $sort: { createdAt: -1 },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ])
        .toArray();

      const formattedArticles = articles.map((article) =>
        serializePopulatedArticle(article)
      );

      return res.status(200).json({
        articles: formattedArticles,
        metadata: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const validatedData = createArticleSchema.parse(req.body);

      const newArticle: Omit<ArticleDocument, "_id"> = {
        title: validatedData.title,
        content: validatedData.content,
        coverImage: validatedData.coverImage,
        author: new ObjectId(session.user.id),
        createdAt: new Date(),
      };

      const result = await db
        .collection<Omit<ArticleDocument, "_id">>("article")
        .insertOne(newArticle);

      const article: Article = {
        id: result.insertedId.toString(),
        ...validatedData,
        author: {
          id: session.user.id,
          name: session.user.name,
        },
        createdAt: new Date().toISOString(),
      };

      return res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }

      console.error("Error creating article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
