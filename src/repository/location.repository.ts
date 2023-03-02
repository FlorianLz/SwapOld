const locationRepository = {
  getCitiesBySearch: async (search: string) => {
    const data = await fetch('https://api-adresse.data.gouv.fr/search/?q=' + search + '&type=municipality&autocomplete=1');
    return await data.json();
  },
};
export default locationRepository;
