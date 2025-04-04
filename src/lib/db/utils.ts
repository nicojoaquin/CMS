import { Db, Collection } from "mongodb";
import clientPromise from "@/lib/db/config";
import { ArticleDocument, UserDocument } from "./types";

type DbCollections = {
  article: Collection<ArticleDocument>;
  user: Collection<UserDocument>;
};

export async function getDb(name: string): Promise<Db> {
  const client = await clientPromise;
  return client.db(name);
}

export async function getCollections(dbName: string): Promise<DbCollections> {
  const db = await getDb(dbName);
  const article = db.collection<ArticleDocument>("article");
  const user = db.collection<UserDocument>("user");

  return { user, article };
}

export async function getCollection<T extends keyof DbCollections>(
  dbName: string,
  collectionName: T
): Promise<DbCollections[T]> {
  const collections = await getCollections(dbName);
  return collections[collectionName];
}
