import locationRepository from '../repository/location.repository';
import locationFactory from '../factory/location.factory';

const locationService = {
  /**
   * getCitiesBySearch récupère les villes correspondantes à une recherche donnée.
   * @param search La chaîne de caractères correspondant à la recherche.
   * @returns Une promesse résolue avec les villes correspondantes à la recherche.
   */
  getCitiesBySearch: async (search: string) => {
    const results = await locationRepository.getCitiesBySearch(search);
    return locationFactory.getCitiesBySearch(results.features);
  },
};
export default locationService;
