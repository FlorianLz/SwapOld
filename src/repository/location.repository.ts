const locationRepository = {
  /**
   * Récupère une liste de villes à partir d'une recherche.
   * @param search La chaîne de caractères à rechercher.
   * @returns Une promesse qui contient la réponse de l'API, sous forme de JSON.
   */
  getCitiesBySearch: async (search: string) => {
    const data = await fetch(
      'https://api-adresse.data.gouv.fr/search/?q=' +
        search +
        '&type=municipality&autocomplete=1',
    );
    return await data.json();
  },
};
export default locationRepository;
