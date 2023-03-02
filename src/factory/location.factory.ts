const locationFactory = {
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
