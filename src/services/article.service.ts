import articleRepository from '../repository/article.repository';
import articleFactory from '../factory/article.factory';
import imageService from './image.service';
import IArticleData from '../interfaces/articleInterface';

const articleService = {
  /**
   * Récupère tous les articles triés par distance par rapport à la position de l'utilisateur,
   * puis les transforme en un tableau d'objets IArticleData.
   * @param userId L'identifiant de l'utilisateur pour lequel récupérer les articles.
   * @returns Un tableau d'objets IArticleData triés par distance.
   */
  getAllArticles: async (userId: any) => {
    const rawArticles = await articleRepository.getAllArticles(userId);
    return articleFactory.getAllArticles(rawArticles, userId);
  },
  /**
   * Récupère les données d'un article à partir de son ID.
   * @param {number} id - L'ID de l'article.
   * @param {string} userId - L'ID de l'utilisateur.
   * @returns {IArticleData} Les données de l'article.
   */
  getArticleById: async (id: number, userId: string) => {
    const rawArticle = await articleRepository.getArticleById(id, userId);
    return articleFactory.getArticleById(rawArticle, userId);
  },

  /**
   * Récupère tous les articles favoris de l'utilisateur donné.
   * @param {string} userId - L'ID de l'utilisateur dont on veut récupérer les articles favoris.
   * @returns {Promise<IArticleData[]>} Les articles favoris de l'utilisateur sous forme d'un tableau d'objets IArticleData.
   */
  getFavoriteArticles: async (userId: string) => {
    const rawArticles = await articleRepository.getFavoriteArticles(userId);
    return articleFactory.getAllArticles(rawArticles, userId);
  },

  /**
   * Basculer l'état similaire d'un article pour un utilisateur
   * @param {number} articleId - L'ID de l'article pour lequel basculer l'état similaire pour
   * @param {number} userId - L'identifiant de l'utilisateur basculant l'état similaire
   * @returns {Promise<boolean>} - Une promesse qui se résout en true si l'état similaire a été basculé avec succès, false sinon
   */
  toggleLikeArticle: async (articleId: number, userId: number) => {
    const like = await articleRepository.toggleLikeArticle(articleId, userId);
    return articleFactory.toggleLikeArticle(like);
  },

  /**
   * Recherche les articles correspondant à la recherche donnée.
   * @param {string} search - La chaîne de caractères à rechercher.
   * @param {string} userId - L'identifiant de l'utilisateur.
   * @returns {Promise<IArticleData[]>} - Les données des articles correspondants à la recherche.
   */
  searchArticles: async (search: string, userId: string) => {
    const rawArticles = await articleRepository.searchArticles(search, userId);
    return articleFactory.getAllArticles(rawArticles, userId);
  },

  /**
   * Récupère tous les articles publiés par l'utilisateur avec l'ID spécifié.
   * @param {string} userId - L'ID de l'utilisateur.
   * @returns {Promise<Array<IArticleData>>} - Une promesse qui contient un tableau d'objets IArticleData représentant tous
   * les articles publiés par l'utilisateur triés par ID dans l'ordre décroissant.
   */
  getAllMyPublishedArticles: async (userId: string) => {
    const rawArticles = await articleRepository.getAllMyPublishedArticles(
      userId,
    );
    const articles = await articleFactory.getAllArticles(rawArticles, userId);
    return articles.sort((a, b) => b.id - a.id);
  },

  /**
   * Récupère tous les articles publiés de l'utilisateur, sauf celui spécifié en paramètre, et les propositions de swap associées.
   * @param id_article L'ID de l'article pour lequel on ne veut pas récupérer les propositions de swap.
   * @param userId L'ID de l'utilisateur.
   * @returns Une promesse qui contient un tableau d'objets IArticleData triés par ID de manière décroissante.
   */
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

  /**
   * Supprime un article ainsi que toutes ses images associées à partir de l'ID de l'article et l'ID de l'utilisateur propriétaire de l'article.
   * @param {number} articleId - L'ID de l'article à supprimer.
   * @param {string} idUser - L'ID de l'utilisateur propriétaire de l'article.
   */
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

  /**
   * Récupère tous les échanges d'un utilisateur ayant un certain état
   * @param state L'état des échanges à récupérer (0: en attente, 1: accepté, 2: refusé)
   * @param userId L'ID de l'utilisateur dont on veut récupérer les échanges
   * @returns Un tableau d'objets IArticleData correspondant aux échanges récupérés
   */
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

  /**
   * Récupère les échanges selon l'état et le profil de l'utilisateur pour afficher dans les messages
   * @param state L'état des échanges à récupérer (0: proposé, 1: accepté, 2: refusé)
   * @param userId L'identifiant de l'utilisateur
   * @returns Une promesse résolue avec les échanges triés par date décroissante
   */
  getSwapsByStateAndProfileForMessages: async (
    state: 0 | 1 | 2,
    userId: string,
  ) => {
    const rawArticles = await articleRepository.getSwapsByStateAndProfile(
      userId,
      state,
    );
    return await articleFactory.getSwapsByStateAndProfileForMessages(
      rawArticles.data,
      userId,
    );
  },

  /**
   * Récupère la date du dernier message pour chaque article
   * @returns un tableau d'objets avec l'id de l'article et la date du dernier message
   */
  getDateLastMessageByIdArticle: async () => {
    const rawArticles = await articleRepository.getDateLastMessageByIdArticle();
    return await articleFactory.getDateLastMessageByIdArticle(
      rawArticles as IArticleData[],
    );
  },
};
export default articleService;
