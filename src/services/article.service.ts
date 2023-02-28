import articleRepository from '../repository/article.repository';
import articleFactory from '../factory/article.factory';

const articleService = {
  getAllArticles: async () => {
    const rawArticles = await articleRepository.getAllArticles();
    return articleFactory.getAllArticles(rawArticles);
  },
  getArticleById: async (id: number) => {
    const rawArticle = await articleRepository.getArticleById(id);
    return articleFactory.getArticleById(rawArticle);
  },
  getFavoriteArticles: async (userId: number) => {
    const rawArticles = await articleRepository.getFavoriteArticles(userId);
    return articleFactory.getAllArticles(rawArticles);
  },
  toggleLikeArticle: async (articleId: number, userId: number) => {
    const like = await articleRepository.toggleLikeArticle(articleId, userId);
    return articleFactory.toggleLikeArticle(like);
  },
  searchArticles: async (search: string) => {
    const rawArticles = await articleRepository.searchArticles(search);
    return articleFactory.getAllArticles(rawArticles);
  },
};
export default articleService;
