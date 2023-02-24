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
        created_at: article.created_at,
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
        id_profile: article.articles_profiles[0].id_profile,
        username: article.articles_profiles[0].profiles.username,
      });
    });
    articles.sort((a, b) => a.distance - b.distance);
    return articles;
  },
};
export default articleFactory;
