import profileRepository from '../repository/profile.repository';
import profileFactory from '../factory/profile.factory';

const profileService = {
  getProfile: async (idUser: string) => {
    const profile = await profileRepository.getProfile(idUser);
    return await profileFactory.getProfile(profile);
  },
};
export default profileService;
