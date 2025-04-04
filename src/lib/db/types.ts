import { ObjectId } from "mongodb";

export type MongoDocument = {
  _id: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
};

export type ArticleDocument = MongoDocument & {
  title: string;
  content: string;
  coverImage?: string;
  author: ObjectId;
};

export type UserDocument = MongoDocument & {
  name: string;
  email: string;
  password: string;
};

export type AuthorDocument = {
  _id: ObjectId;
  name: string;
};

export type PopulatedArticleDocument = Omit<ArticleDocument, "author"> & {
  authorData: AuthorDocument;
};
