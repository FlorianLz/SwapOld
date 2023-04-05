import articleRepository from '../repository/article.repository';
import articleFactory from '../factory/article.factory';
import imageService from './image.service';

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
    const rawArticles = await articleRepository.searchArticles(search, userId);
    return articleFactory.getAllArticles(rawArticles, userId);
  },
  getAllMyPublishedArticles: async (userId: string) => {
    const rawArticles = await articleRepository.getAllMyPublishedArticles(
      userId,
    );
    const articles = await articleFactory.getAllArticles(rawArticles, userId);
    return articles.sort((a, b) => b.id - a.id);
  },
  getAllMyPublishedArticlesNotProposedForSpecificId: async (
    id_article: number,
    userId: string,
  ) => {
    const rawArticles = await articleRepository.getAllMyPublishedArticles(
      userId,
    );

    const rawSwaps = await articleRepository.getAllMyPropositionsToSwap(userId);

    const articles = await articleFactory.getAllMyPropositionsToSwap(
      rawArticles,
      userId,
      id_article,
      rawSwaps,
    );

    return articles.sort((a, b) => b.id - a.id);
  },
  deleteArticle: async (articleId: number, idUser: string) => {
    const deleteImages = await articleRepository.deleteArticle(
      articleId,
      idUser,
    );
    if (deleteImages.error) {
      return {error: true, message: deleteImages.message};
    } else {
      return await imageService.deleteAllImagesFromBucket(idUser, articleId);
    }
  },
  getSwapsByStateAndProfile: async (state: 0 | 1 | 2, userId: string) => {
    const rawArticles = await articleRepository.getSwapsByStateAndProfile(
      userId,
      state,
    );
    return await articleFactory.getSwapsByStateAndProfile(
      rawArticles.data,
      userId,
    );
  },
};
export default articleService;
