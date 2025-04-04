import { Article, SearchArticleItem } from "@/lib/services/articles/types";
import ArticleCard from "./article-card";

type Props = {
  articles: Article[] | SearchArticleItem[];
};

const ArticlesList = ({ articles }: Props) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-[#EFEBE9]">
        {articles.map((article) => (
          <ArticleCard key={article.id} {...article} />
        ))}
      </ul>
    </div>
  );
};

export default ArticlesList;
