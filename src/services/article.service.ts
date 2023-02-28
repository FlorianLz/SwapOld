import articleRepository from '../repository/article.repository';
import articleFactory from '../factory/article.factory';

const articleService = {
  getAllArticles: async (userId: any) => {
    const rawArticles = await articleRepository.getAllArticles(userId);
    return articleFactory.getAllArticles(rawArticles);
  },
  getArticleById: async (id: number, userId: string) => {
    const rawArticle = await articleRepository.getArticleById(id, userId);
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
  getAllMyPublishedArticles: async (userId: string) => {
    const rawArticles = await articleRepository.getAllMyPublishedArticles(
      userId,
    );
    const articles = await articleFactory.getAllArticles(rawArticles);
    return articles.reverse();
  },
};
export default articleService;
