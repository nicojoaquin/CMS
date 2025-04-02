import { ObjectId } from "mongodb";

// Base MongoDB document interface
export type MongoDocument = {
  _id: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
};

// Article document as stored in MongoDB
export type ArticleDocument = MongoDocument & {
  title: string;
  content: string;
  coverImage?: string;
  author: ObjectId;
};

// User document as stored in MongoDB
export type UserDocument = MongoDocument & {
  name: string;
  email: string;
  password: string;
};

export interface AuthorDocument {
  _id: ObjectId;
  name: string;
}

// Article with author information (after population)
export type PopulatedArticleDocument = Omit<ArticleDocument, "author"> & {
  authorData: AuthorDocument;
};
