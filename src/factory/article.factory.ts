import IArticleData from '../interfaces/articleInterface';
import imagesHelper from '../helpers/images.helper';
import locationHelper from '../helpers/location.helper';

const articleFactory = {
  getAllArticles: async (rawArticles: any, userId: string) => {
    if (!rawArticles) {
      return [];
    }
    let articles: IArticleData[] = [];
    let location = await locationHelper.getUserLocation();
    articles = rawArticles.map((article: any) => {
      return <IArticleData>{
        id: article.id,
        title: article.title,
        distance: locationHelper.getDistanceFromLatLonInKm(
          location.coords.latitude,
          location.coords.longitude,
          article.location.latitude,
          article.location.longitude,
        ),
        location_name: article.location.cityName,
        images: imagesHelper.getPublicUrlByImageName(
          article.articles_images[0]?.image_name ?? 'default/default.png',
        ),
        isLiked: article.articles_favorites?.length > 0,
        isOwner: article.articles_profiles[0]?.id_profile === userId,
      };
    });
    articles.sort((a, b) => a.distance - b.distance);
    return articles;
  },
  getArticleById: async (rawArticle: any, userId: string) => {
    const images =
      rawArticle.articles_images.length > 0
        ? rawArticle.articles_images.map((image: any) => {
            return imagesHelper.getPublicUrlByImageName(image.image_name);
          })
        : [imagesHelper.getPublicUrlByImageName('default/default.png')];
    let location = await locationHelper.getUserLocation();
    return <IArticleData>{
      id: rawArticle.id,
      title: rawArticle.title,
      created_at: rawArticle.created_at,
      description: rawArticle.description,
      distance: locationHelper.getDistanceFromLatLonInKm(
        location.coords.latitude,
        location.coords.longitude,
        rawArticle.location.latitude,
        rawArticle.location.longitude,
      ),
      location_name: rawArticle.location.cityName,
      images: images,
      id_profile: rawArticle.articles_profiles[0].id_profile,
      username: rawArticle.articles_profiles[0].profiles.username,
      isLiked: rawArticle.articles_favorites?.length > 0,
      isOwner: rawArticle.articles_profiles[0]?.id_profile === userId,
    };
  },
  toggleLikeArticle: async (like: any) => {
    if (like.status === 204) {
      return {isLiked: false, error: false};
    } else if (like.status === 201) {
      return {isLiked: true, error: false};
    }
    return {error: true, isLiked: false};
  },
  getSwapsByStateAndProfile: async (rawArticles: any, userId: string) => {
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
          location.coords.latitude,
          location.coords.longitude,
          article.id_article_receiver.location.latitude,
          article.id_article_receiver.location.longitude,
        ),
        location_name: article.id_article_receiver.location.cityName,
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
    articles.sort((a, b) => a.distance - b.distance);
    return articles;
  },
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
          location.coords.latitude,
          location.coords.longitude,
          article.location.latitude,
          article.location.longitude,
        ),
        location_name: article.location.cityName,
        images: imagesHelper.getPublicUrlByImageName(
          article.articles_images[0]?.image_name ?? 'default/default.png',
        ),
        isLiked: article.articles_favorites?.length > 0,
        isOwner: article.articles_profiles[0]?.id_profile === userId,
      };
    });
    articles.sort((a, b) => a.distance - b.distance);
    articles = articles.filter((article: IArticleData) => {
      return !excludedArticles.includes(article.id);
    });
    return articles;
  },
};
export default articleFactory;
