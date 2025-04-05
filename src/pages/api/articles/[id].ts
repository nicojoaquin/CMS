import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "../../../lib/auth/config";
import { getDb } from "@/lib/db/utils";
import { ObjectId } from "mongodb";
import { ArticleDocument, PopulatedArticleDocument } from "@/lib/db/types";
import { toWebHeaders, serializePopulatedArticle } from "@/lib/api/utils";
import { z } from "zod";
import { updateArticleSchema } from "@/lib/api/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify authentication
  const session = await getServerSession({
    headers: toWebHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid article ID" });
  }

  let articleId: ObjectId;
  try {
    articleId = new ObjectId(id);
  } catch (_error) {
    return res.status(400).json({ message: "Invalid article ID format" });
  }

  const db = await getDb("blog-cms");

  if (req.method === "GET") {
    try {
      const article = await db
        .collection<ArticleDocument>("article")
        .aggregate<PopulatedArticleDocument>([
          {
            $match: { _id: articleId },
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
        ])
        .next();

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const isAuthor = article.authorData._id.equals(
        new ObjectId(session.user.id)
      );

      if (!isAuthor) {
        return res.status(403).json({
          message: "You don't have permission to access this article",
        });
      }

      return res.status(200).json(serializePopulatedArticle(article));
    } catch (error) {
      console.error("Error fetching article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const existingArticle = await db
        .collection<ArticleDocument>("article")
        .findOne({ _id: articleId });

      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (!existingArticle.author.equals(new ObjectId(session.user.id))) {
        return res.status(403).json({
          message: "You don't have permission to update this article",
        });
      }

      const validatedData = updateArticleSchema.parse(req.body);

      const result = await db.collection<ArticleDocument>("article").updateOne(
        { _id: articleId },
        {
          $set: {
            ...validatedData,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      const updatedArticle = await db
        .collection<ArticleDocument>("article")
        .aggregate<PopulatedArticleDocument>([
          {
            $match: { _id: articleId },
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
        ])
        .next();

      if (!updatedArticle) {
        return res.status(404).json({ message: "Updated article not found" });
      }

      return res.status(200).json(serializePopulatedArticle(updatedArticle));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }

      console.error("Error updating article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const existingArticle = await db
        .collection<ArticleDocument>("article")
        .findOne({ _id: articleId });

      if (!existingArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      if (!existingArticle.author.equals(new ObjectId(session.user.id))) {
        return res.status(403).json({
          message: "You don't have permission to delete this article",
        });
      }

      const result = await db
        .collection<ArticleDocument>("article")
        .deleteOne({ _id: articleId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
