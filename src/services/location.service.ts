import locationRepository from '../repository/location.repository';
import locationFactory from "../factory/location.factory";

const locationService = {
  getCitiesBySearch: async (search: string) => {
    const results = await locationRepository.getCitiesBySearch(search);
    return locationFactory.getCitiesBySearch(results.features);
  },
};
export default locationService;
