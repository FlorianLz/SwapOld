import IArticleData from '../interfaces/articleInterface';
import imagesHelper from '../helpers/images.helper';
import locationHelper from '../helpers/location.helper';

const articleFactory = {
  getAllArticles: async (rawArticles: any) => {
    let articles: IArticleData[] = [];
    let location = await locationHelper.getUserLocation();
    rawArticles.map((article: any) => {
      articles.push(<IArticleData>{
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
          article.articles_images[0].image_name,
        ),
        isLiked: article.articles_favorites.length > 0,
      });
    });
    articles.sort((a, b) => a.distance - b.distance);
    return articles;
  },
  getArticleById: async (rawArticle: any) => {
    let images: string[] = [];
    rawArticle.articles_images.map((image: any) => {
      images.push(imagesHelper.getPublicUrlByImageName(image.image_name));
    });
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
      isLiked: rawArticle.articles_favorites.length > 0,
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
};
export default articleFactory;
