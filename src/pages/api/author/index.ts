import { toWebHeaders } from "@/lib/api/utils";
import { getServerSession } from "@/lib/auth/config";
import { UserDocument } from "@/lib/db/types";
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

  try {
    const db = await getDb("blog-cms");

    const authors = await db
      .collection<UserDocument>("user")
      .aggregate([
        {
          $lookup: {
            from: "article",
            localField: "_id",
            foreignField: "author",
            as: "articles",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            articleCount: { $size: "$articles" },
          },
        },
        {
          $sort: { articleCount: -1 },
        },
      ])
      .toArray();

    const formattedAuthors = authors.map((author) => ({
      ...author,
      id: author._id.toString(),
    }));

    return res.status(200).json(formattedAuthors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
