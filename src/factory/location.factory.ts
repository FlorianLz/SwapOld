const locationFactory = {
  /**
   * Transforme un tableau de villes en un tableau d'objets avec les informations nécessaires pour l'affichage.
   * @param {Array} cities - Un tableau d'objets représentant les villes retournées par l'API de géocodage.
   * @returns {Array} Un tableau d'objets contenant les informations des villes nécessaires pour l'affichage.
   */
  getCitiesBySearch: (cities: []) => {
    return cities.map((city: any) => {
      return {
        cityName: city.properties.label,
        latitude: city.geometry.coordinates[1],
        longitude: city.geometry.coordinates[0],
        title: city.properties.label,
        id: city.properties.id,
      };
    });
  },
};
export default locationFactory;
