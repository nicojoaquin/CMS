export type CreateArticleRequest = {
  title: string;
  content: string;
  coverImage: string;
};

export type CreateArticleResponse = Article;

export type UpdateArticleRequest = Partial<CreateArticleRequest>;
export type UpdateArticleResponse = Article;

export type SearchArticlesRequest = {
  query: string;
};
export type SearchArticlesResponse = SearchArticleItem[];
export type SearchArticleItem = Article & {
  isOwner: boolean;
};
export type GetArticleByIdResponse = Article;

export type GetArticlesResponse = {
  articles: Article[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type Article = {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
};
