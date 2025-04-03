import { Db, Collection } from "mongodb";
import clientPromise from "@/lib/db/config";
import { ArticleDocument, UserDocument } from "./types";

// Define the types for our collections
interface DbCollections {
  article: Collection<ArticleDocument>;
  user: Collection<UserDocument>;
}

// Cached connection
let cachedDb: Db | null = null;
let collections: DbCollections | null = null;

// Create MongoDB indexes for better query performance
async function createIndexes(db: Db) {
  const article = db.collection<ArticleDocument>("article");
  const user = db.collection<UserDocument>("user");

  // Article indexes
  await article.createIndex({ author: 1 }, { background: true });
  await article.createIndex({ createdAt: -1 }, { background: true });
  await article.createIndex(
    { title: "text", content: "text" },
    {
      background: true,
      weights: {
        title: 10,
        content: 5,
      },
    }
  );

  // User indexes
  await user.createIndex({ email: 1 }, { unique: true, background: true });
  await user.createIndex({ name: 1 }, { background: true });

  return {
    article,
    user,
  } as DbCollections;
}

export async function getDb(name: string): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await clientPromise;
  const db = client.db(name);
  cachedDb = db;
  return db;
}

export async function getCollections(dbName: string): Promise<DbCollections> {
  if (collections) {
    return collections;
  }

  const db = await getDb(dbName);
  collections = await createIndexes(db);
  return collections;
}

// Function to get a specific typed collection
export async function getCollection<T extends keyof DbCollections>(
  dbName: string,
  collectionName: T
): Promise<DbCollections[T]> {
  const collections = await getCollections(dbName);
  return collections[collectionName];
}
