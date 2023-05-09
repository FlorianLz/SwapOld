import profileRepository from '../repository/profile.repository';
import profileFactory from '../factory/profile.factory';

const profileService = {
  /**
   * getProfile récupère le profil d'un utilisateur donné.
   * @param idUser L'identifiant de l'utilisateur dont on veut récupérer le profil.
   * @returns Une promesse résolue avec le profil de l'utilisateur donné.
   */
  getProfile: async (idUser: string) => {
    const profile = await profileRepository.getProfile(idUser);
    return await profileFactory.getProfile(profile);
  },
};
export default profileService;
