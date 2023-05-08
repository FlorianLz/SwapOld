import IArticleData from '../interfaces/articleInterface';
import imagesHelper from '../helpers/images.helper';
import locationHelper from '../helpers/location.helper';

const articleFactory = {
  /**
   * Récupère tous les articles
   */
  getAllArticles: async (rawArticles: any, userId: string) => {
    // Vérifie si des articles ont été récupérés
    if (!rawArticles) {
      return [];
    }

    // Récupère la position de l'utilisateur
    let location = await locationHelper.getUserLocation();

    // Transforme les données brutes des articles en un objet IArticleData
    let articles: IArticleData[] = rawArticles.map((article: any) => {
      return <IArticleData>{
        id: article.id,
        title: article.title,
        distance: locationHelper.getDistanceFromLatLonInKm(
          location.coords?.latitude,
          location.coords?.longitude,
          article.location?.latitude,
          article.location?.longitude,
        ),
        location_name: article.location?.cityName,
        images: imagesHelper.getPublicUrlByImageName(
          article.articles_images[0]?.image_name ?? 'default/default.png',
        ),
        isLiked: article.articles_favorites?.length > 0,
        isOwner: article.articles_profiles[0]?.id_profile === userId,
        status: article.status,
      };
    });

    // Trie les articles par distance
    articles.sort((a, b) => a.distance - b.distance);

    return articles;
  },

  /**
   * Récupère les données d'un article à partir de l'objet brut renvoyé par l'API.
   * @param {Object} rawArticle - L'objet brut représentant l'article.
   * @param {string} userId - L'identifiant de l'utilisateur courant.
   * @returns {IArticleData} - Les données de l'article sous la forme d'un objet IArticleData.
   */
  getArticleById: async (rawArticle: any, userId: string) => {
    // Si l'objet brut est vide, on retourne null
    if (Object.keys(rawArticle).length === 0) {
      return null;
    }
    // On récupère les images de l'article
    const images =
      rawArticle.articles_images?.length > 0
        ? rawArticle.articles_images.map((image: any) => {
            return imagesHelper.getPublicUrlByImageName(image.image_name);
          })
        : [imagesHelper.getPublicUrlByImageName('default/default.png')];
    // On récupère la localisation de l'utilisateur
    let location = await locationHelper.getUserLocation();
    // On crée l'objet IArticleData correspondant aux données de l'article
    return <IArticleData>{
      id: rawArticle?.id,
      title: rawArticle?.title,
      created_at: rawArticle?.created_at,
      description: rawArticle?.description,
      distance: locationHelper.getDistanceFromLatLonInKm(
        location.coords?.latitude,
        location.coords?.longitude,
        rawArticle?.location?.latitude,
        rawArticle?.location?.longitude,
      ),
      location_name: rawArticle?.location?.cityName,
      images: images,
      id_profile: rawArticle?.articles_profiles[0]?.id_profile,
      username: rawArticle?.articles_profiles[0]?.profiles.username,
      isLiked: rawArticle?.articles_favorites?.length > 0,
      isOwner: rawArticle?.articles_profiles[0]?.id_profile === userId,
      status: rawArticle?.status,
    };
  },

  /**
   * Fonction qui permet de gérer le résultat de la requête pour aimer ou enlever l'appréciation sur un article.
   * @param like - Objet contenant les informations de la requête pour aimer ou enlever l'appréciation.
   * @returns - Un objet contenant une propriété `isLiked` qui indique si l'article est aimé ou non, une propriété `error` qui indique s'il y a eu une erreur ou non.
   */
  toggleLikeArticle: async (like: any) => {
    if (like.status === 204) {
      return {isLiked: false, error: false};
    } else if (like.status === 201) {
      return {isLiked: true, error: false};
    }
    return {error: true, isLiked: false};
  },

  /**
   * Cette fonction prend en entrée une liste d'articles bruts échangés entre deux utilisateurs,
   * ainsi que l'ID de l'utilisateur courant. Elle renvoie une liste d'objets qui représentent
   * les articles échangés triés par distance par rapport à la position de l'utilisateur,
   * avec les informations pertinentes pour l'affichage.
   *
   * @async
   * @function getSwapsByStateAndProfile
   * @param {Array} rawArticles - La liste brute d'articles échangés entre deux utilisateurs
   * @param {string} userId - L'ID de l'utilisateur courant
   * @returns {Promise<Array<IArticleData>>} La liste triée d'objets d'articles échangés avec les informations pertinentes pour l'affichage
   */

  getSwapsByStateAndProfile: async (rawArticles: any, userId: string) => {
    // Vérifie si des articles ont été récupérés
    if (!rawArticles) {
      return [];
    }
    let articles: IArticleData[] = [];
    let location = await locationHelper.getUserLocation();
    articles = rawArticles.map((article: any) => {
      return <IArticleData>{
        id: article.id_article_receiver.id,
        title: article.id_article_receiver.title,
        distance: locationHelper.getDistanceFromLatLonInKm(
          location.coords?.latitude,
          location.coords?.longitude,
          article.id_article_receiver.location?.latitude,
          article.id_article_receiver.location?.longitude,
        ),
        location_name: article.id_article_receiver.location?.cityName,
        images: imagesHelper.getPublicUrlByImageName(
          article.id_article_receiver.articles_images[0]?.image_name,
        ),
        isLiked: article.id_article_receiver.articles_favorites?.length > 0,
        isOwner:
          article.id_article_receiver.articles_profiles[0]?.id_profile ===
          userId,
        ownerInfos: {
          id: article.id_article_receiver.articles_profiles[0]?.id_profile,
          username:
            article.id_article_receiver.articles_profiles[0]?.profiles.username,
          avatar_url: imagesHelper.getPublicUrlByImageName(
            article.id_article_receiver.articles_profiles[0]?.profiles
              .avatar_url,
          ),
        },
        receiverInfos: {
          id: article.id_article_sender.articles_profiles[0]?.id_profile,
          username:
            article.id_article_sender.articles_profiles[0]?.profiles.username,
          avatar_url: imagesHelper.getPublicUrlByImageName(
            article.id_article_sender.articles_profiles[0]?.profiles.avatar_url,
          ),
        },
      };
    });
    // On trie les articles par distance
    articles.sort((a, b) => a.distance - b.distance);
    return articles;
  },

  /**
   * Récupère les articles pour lesquels l'utilisateur est propriétaire ou destinataire, et trie les résultats en fonction de la distance de l'utilisateur.
   * @param {any} rawArticles - Les articles bruts récupérés de l'API.
   * @param {string} userId - L'ID de l'utilisateur courant.
   * @returns {Array<IArticleData>} - Les données des articles triées par distance.
   */
  getSwapsByStateAndProfileForMessages: async (
    rawArticles: any,
    userId: string,
  ) => {
    if (!rawArticles) {
      return [];
    }
    let articles: IArticleData[] = [];
    let location = await locationHelper.getUserLocation();
    articles = rawArticles.map((article: any) => {
      return <IArticleData>{
        id: article.id_article_receiver.id,
        id2: article.id_article_sender.id,
        title:
          article.id_article_receiver.articles_profiles[0]?.id_profile ===
          userId
            ? article.id_article_sender.title
            : article.id_article_receiver.title,
        title2:
          article.id_article_receiver.articles_profiles[0]?.id_profile ===
          userId
            ? article.id_article_receiver.title
            : article.id_article_sender.title,
        status2:
          article.id_article_receiver.articles_profiles[0]?.id_profile ===
          userId
            ? article.id_article_receiver.echange_valide
            : article.id_article_sender.echange_valide,
        distance: locationHelper.getDistanceFromLatLonInKm(
          location.coords?.latitude,
          location.coords?.longitude,
          article.id_article_receiver.location?.latitude,
          article.id_article_receiver.location?.longitude,
        ),
        location_name: article.id_article_receiver.location?.cityName,
        images: imagesHelper.getPublicUrlByImageName(
          article.id_article_receiver.articles_profiles[0]?.id_profile ===
            userId
            ? article.id_article_sender.articles_images[0]?.image_name
            : article.id_article_receiver.articles_images[0]?.image_name,
        ),
        isLiked: article.id_article_receiver.articles_favorites?.length > 0,
        isOwner:
          article.id_article_receiver.articles_profiles[0]?.id_profile ===
          userId,
        ownerInfos: {
          id: article.id_article_receiver.articles_profiles[0]?.id_profile,
          username:
            article.id_article_receiver.articles_profiles[0]?.profiles.username,
          avatar_url: imagesHelper.getPublicUrlByImageName(
            article.id_article_receiver.articles_profiles[0]?.profiles
              .avatar_url,
          ),
        },
        receiverInfos: {
          id: article.id_article_sender.articles_profiles[0]?.id_profile,
          username:
            article.id_article_sender.articles_profiles[0]?.profiles.username,
          avatar_url: imagesHelper.getPublicUrlByImageName(
            article.id_article_sender.articles_profiles[0]?.profiles.avatar_url,
          ),
        },
      };
    });
    articles.sort((a, b) => a.distance - b.distance);
    return articles;
  },

  /**
   * Récupère toutes les propositions d'échange pour un article donné, à l'exception de celles déjà échangées.
   *
   * @param {Array} rawArticles - Liste brute des articles récupérés de la base de données.
   * @param {string} userId - ID de l'utilisateur actuellement connecté.
   * @param {number} article_id - ID de l'article pour lequel on veut récupérer les propositions d'échange.
   * @param {Array} rawSwaps - Liste brute des propositions d'échange récupérées de la base de données.
   *
   * @returns {Array} Une liste d'objets d'articles triée par distance, sans les articles qui ont déjà été échangés.
   */
  getAllMyPropositionsToSwap: async (
    rawArticles: any,
    userId: string,
    article_id: number,
    rawSwaps: any,
  ) => {
    if (!rawArticles) {
      return [];
    }

    let excludedArticles = rawSwaps.map((swap: any) => {
      return swap.id_article_sender === article_id
        ? swap.id_article_receiver
        : null;
    });

    let articles: IArticleData[] = [];
    let location = await locationHelper.getUserLocation();
    articles = rawArticles.map((article: any) => {
      return <IArticleData>{
        id: article.id,
        title: article.title,
        distance: locationHelper.getDistanceFromLatLonInKm(
          location.coords?.latitude,
          location.coords?.longitude,
          article.location?.latitude,
          article.location?.longitude,
        ),
        location_name: article.location?.cityName,
        images: imagesHelper.getPublicUrlByImageName(
          article.articles_images[0]?.image_name ?? 'default/default.png',
        ),
        isLiked: article.articles_favorites?.length > 0,
        isOwner: article.articles_profiles[0]?.id_profile === userId,
        status: article.status,
      };
    });
    articles.sort((a, b) => a.distance - b.distance);
    articles = articles.filter((article: IArticleData) => {
      return !excludedArticles.includes(article.id);
    });
    return articles;
  },

  /**
   * Récupère un tableau d'ID d'articles correspondant aux derniers messages échangés pour chaque article de la liste.
   * @param rawArticles Un tableau d'objets représentant les articles échangés.
   * @returns Un tableau d'ID d'articles.
   */
  getDateLastMessageByIdArticle: async (rawArticles: IArticleData[]) => {
    let tab: [] = [];
    rawArticles.forEach((article: any) => {
      if (!tab.includes(article.id_article as never)) {
        tab.push(article.id_article as never);
      }
    });
    return tab;
  },
};
export default articleFactory;
