import Geolocation from '@react-native-community/geolocation';
import ICoordData from '../interfaces/locationInterface';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../lib/initSupabase';
const locationHelper = {
  /**
   * Calcule la distance en kilomètres entre deux points géographiques définis par leur latitude et leur longitude.
   * @param {number} lat1 - La latitude du premier point.
   * @param {number} lon1 - La longitude du premier point.
   * @param {number} lat2 - La latitude du deuxième point.
   * @param {number} lon2 - La longitude du deuxième point.
   * @returns {number} - La distance en kilomètres entre les deux points.
   */
  getDistanceFromLatLonInKm: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180); // Différence de latitude en radians
    const dLon = (lon2 - lon1) * (Math.PI / 180); // Différence de longitude en radians
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2); // Formule de Haversine pour calculer l'angle central
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Angle en radians entre les deux points
    return Math.round(R * c); // Distance en km arrondie à l'entier le plus proche
  },

  /**
   * Récupère la position de l'utilisateur en utilisant l'API Geolocation
   * Si l'utilisateur a désactivé la géolocalisation, la dernière position connue sera retournée
   * Si aucune position n'est disponible, la position par défaut sera renvoyée
   * @returns {Promise} Une promesse qui résout avec un objet contenant un indicateur de statut, des données de position et des coordonnées
   */
  getUserLocation: async () => {
    // Définit une fonction pour récupérer la position actuelle
    const getCurrentPosition = () =>
      new Promise((resolve, error) =>
        Geolocation.getCurrentPosition(resolve, error, {}),
      );
    try {
      // Tente de récupérer la position actuelle de l'utilisateur
      const Data: ICoordData = <ICoordData>await getCurrentPosition();
      return {
        Status: true,
        Data,
        coords: {
          latitude: Data.coords?.latitude,
          longitude: Data.coords?.longitude,
        },
      };
    } catch (error) {
      // Si la récupération de la position échoue, vérifie s'il existe une position par défaut enregistrée localement
      let jsonValue = await AsyncStorage.getItem('UserDefaultLocation');
      if (jsonValue != null) {
        // Si une position par défaut est disponible, retourne la position par défaut
        return {Status: false, Data: error, coords: JSON.parse(jsonValue)};
      } else {
        // Si aucune position par défaut n'est disponible, définit une position par défaut et retourne cette position
        await locationHelper.setUserDefaultLocation();
        jsonValue = await AsyncStorage.getItem('UserDefaultLocation');
        if (jsonValue != null) {
          return {Status: false, Data: error, coords: JSON.parse(jsonValue)};
        } else {
          return {
            Status: false,
            Data: error,
            coords: {latitude: 0, longitude: 0},
          };
        }
      }
    }
  },

  /**
   * Récupère la localisation par défaut de l'utilisateur depuis sa table de profil sur la base de données.
   * La localisation par défaut est ensuite stockée dans le stockage local de l'application.
   */
  setUserDefaultLocation: async () => {
    // Récupérer la session utilisateur en cours.
    const session = await supabase.auth.getSession();
    // Récupérer l'ID de l'utilisateur à partir de la session.
    const idUser = session.data.session?.user?.id;
    // Rechercher les coordonnées de l'utilisateur dans sa table de profil.
    let coord = await supabase
      .from('profiles')
      .select('location')
      .eq('id', idUser);
    // Si les coordonnées sont disponibles, stocker la localisation par défaut dans le stockage local de l'application.
    if (coord.data != null) {
      await AsyncStorage.setItem(
        'UserDefaultLocation',
        JSON.stringify({
          latitude: coord.data[0]?.location?.latitude,
          longitude: coord.data[0]?.location?.longitude,
        }),
      );
    }
  },
};
export default locationHelper;
