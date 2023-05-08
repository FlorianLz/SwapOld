import imagesHelper from '../helpers/images.helper';

const profileFactory = {
  /**
   * Obtient les informations de profil d'un utilisateur à partir d'un objet de profil brut.
   * @async
   * @param {any} rawProfile - L'objet brut représentant le profil de l'utilisateur.
   */
  getProfile: async (rawProfile: any) => {
    // Extrait les propriétés pertinentes de l'objet rawProfile pour créer un nouvel objet de profil formaté
    return {
      id: rawProfile.id,
      username: rawProfile.username,
      full_name: rawProfile.full_name,
      city_name: rawProfile.location.cityName,
      avatar_url: imagesHelper.getPublicUrlByImageName(rawProfile.avatar_url),
    };
  },
};
export default profileFactory;
