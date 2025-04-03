export type CreateArticleRequest = {
  title: string;
  content: string;
  coverImage?: string;
};

export type UpdateArticleRequest = Partial<CreateArticleRequest>;

export type SearchArticlesRequest = {
  query: string;
};

export type GetArticleResponse = Article;

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
  coverImage?: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
};
