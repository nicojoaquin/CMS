import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "../../../lib/auth/config";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/utils";
import { ArticleDocument, PopulatedArticleDocument } from "@/lib/db/types";
import { serializePopulatedArticle, toWebHeaders } from "@/lib/api/utils";
import { updateArticleSchema } from "@/lib/api/schemas";

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

  const { id } = req.query;
  if (!ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: "Invalid article ID" });
  }

  const db = await getDb("blog-cms");
  const articleId = new ObjectId(id as string);

  if (req.method === "GET") {
    try {
      const [article] = await db
        .collection<ArticleDocument>("article")
        .aggregate<PopulatedArticleDocument>([
          {
            $match: { _id: new ObjectId(articleId) },
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
            $limit: 1,
          },
        ])
        .toArray();

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const formattedArticle = serializePopulatedArticle(article);
      return res.status(200).json(formattedArticle);
    } catch (error) {
      console.error("Error fetching article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const validatedData = updateArticleSchema.parse(req.body);

      const result = await db.collection<ArticleDocument>("article").updateOne(
        { _id: new ObjectId(articleId) },
        {
          $set: {
            title: validatedData.title,
            content: validatedData.content,
            coverImage: validatedData.coverImage,
            updatedAt: new Date(),
          },
        }
      );

      if (!result) {
        return res.status(404).json({ error: "Article not found" });
      }

      const updatedArticle = await db
        .collection<ArticleDocument>("article")
        .aggregate<PopulatedArticleDocument>([
          {
            $match: { _id: new ObjectId(articleId) },
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
            $limit: 1,
          },
        ])
        .toArray();

      const article = serializePopulatedArticle(updatedArticle[0]);

      return res.status(200).json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const result = await db
        .collection("article")
        .deleteOne({ _id: articleId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Article not found" });
      }

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
