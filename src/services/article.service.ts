import articleRepository from '../repository/article.repository';
import articleFactory from '../factory/article.factory';

const articleService = {
  getAllArticles: async (userId: any) => {
    const rawArticles = await articleRepository.getAllArticles(userId);
    return articleFactory.getAllArticles(rawArticles, userId);
  },
  getArticleById: async (id: number, userId: string) => {
    const rawArticle = await articleRepository.getArticleById(id, userId);
    return articleFactory.getArticleById(rawArticle, userId);
  },
  getFavoriteArticles: async (userId: string) => {
    const rawArticles = await articleRepository.getFavoriteArticles(userId);
    return articleFactory.getAllArticles(rawArticles, userId);
  },
  toggleLikeArticle: async (articleId: number, userId: number) => {
    const like = await articleRepository.toggleLikeArticle(articleId, userId);
    return articleFactory.toggleLikeArticle(like);
  },
  searchArticles: async (search: string, userId: string) => {
    const rawArticles = await articleRepository.searchArticles(search);
    return articleFactory.getAllArticles(rawArticles, userId);
  },
  getAllMyPublishedArticles: async (userId: string) => {
    const rawArticles = await articleRepository.getAllMyPublishedArticles(
      userId,
    );
    const articles = await articleFactory.getAllArticles(rawArticles, userId);
    return articles.reverse();
  },
  deleteArticle: async (articleId: number) => {
    return await articleRepository.deleteArticle(articleId);
  },
};
export default articleService;
