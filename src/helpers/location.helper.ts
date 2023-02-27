import Geolocation from '@react-native-community/geolocation';
import ICoordData from '../interfaces/locationInterface';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {json} from 'stream/consumers';
import {supabase} from '../lib/initSupabase';
const locationHelper = {
  getDistanceFromLatLonInKm: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },
  getUserLocation: async () => {
    const getCurrentPosition = () =>
      new Promise((resolve, error) =>
        Geolocation.getCurrentPosition(resolve, error, {}),
      );
    try {
      const Data: ICoordData = <ICoordData>await getCurrentPosition();
      return {
        Status: true,
        Data,
        coords: {
          latitude: Data.coords.latitude,
          longitude: Data.coords.longitude,
        },
      };
    } catch (error) {
      let jsonValue = await AsyncStorage.getItem('UserDefaultLocation');
      if (jsonValue != null) {
        return {Status: false, Data: error, coords: JSON.parse(jsonValue)};
      } else {
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
  setUserDefaultLocation: async () => {
    const session = await supabase.auth.getSession();
    const idUser = session.data.session?.user?.id;
    let coord = await supabase
      .from('profiles')
      .select('location')
      .eq('id', idUser);
    if (coord.data != null) {
      await AsyncStorage.setItem(
        'UserDefaultLocation',
        JSON.stringify({
          latitude: coord.data[0].location.latitude,
          longitude: coord.data[0].location.longitude,
        }),
      );
    }
  },
};
export default locationHelper;
