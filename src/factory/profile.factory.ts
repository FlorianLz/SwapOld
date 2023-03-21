import imagesHelper from '../helpers/images.helper';

const profileFactory = {
  getProfile: async (rawProfile: any) => {
    return {
      id: rawProfile.id,
      username: rawProfile.username,
      full_name: rawProfile.full_name,
      city_name: rawProfile.location.cityName,
      avatar_url: imagesHelper.getPublicUrlByImageName(rawProfile.avatar),
    };
  },
};
export default profileFactory;
