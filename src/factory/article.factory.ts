import IArticleData from '../interfaces/articleInterface';
import imagesHelper from '../helpers/images.helper';
import locationHelper from '../helpers/location.helper';

const articleFactory = {
  getAllArticles: (rawArticles: any) => {
    let articles: IArticleData[] = [];
    rawArticles.map((article: any) => {
      articles.push(<IArticleData>{
        id: article.id,
        title: article.title,
        distance: locationHelper.getDistanceFromLatLonInKm(
          locationHelper.getUserLocation().latitude,
          locationHelper.getUserLocation().longitude,
          article.location.latitude,
          article.location.longitude,
        ),
        location_name: article.location.cityName,
        images: imagesHelper.getPublicUrlByImageName(
          article.articles_images[0].image_name,
        ),
      });
    });
    articles.sort((a, b) => a.distance - b.distance);
    return articles;
  },
  getArticleById: (rawArticle: any) => {
    let images: string[] = [];
    rawArticle.articles_images.map((image: any) => {
      images.push(imagesHelper.getPublicUrlByImageName(image.image_name));
    });
    return <IArticleData>{
      id: rawArticle.id,
      title: rawArticle.title,
      created_at: rawArticle.created_at,
      description: rawArticle.description,
      distance: locationHelper.getDistanceFromLatLonInKm(
        locationHelper.getUserLocation().latitude,
        locationHelper.getUserLocation().longitude,
        rawArticle.location.latitude,
        rawArticle.location.longitude,
      ),
      location_name: rawArticle.location.cityName,
      images: images,
      id_profile: rawArticle.articles_profiles[0].id_profile,
      username: rawArticle.articles_profiles[0].profiles.username,
    };
  },
};
export default articleFactory;
