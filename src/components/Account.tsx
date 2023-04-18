import React, {useState, useEffect, useCallback} from 'react';
import {supabase} from '../lib/initSupabase';
import {
  StyleSheet,
  View,
  Alert,
  Text,
  TextInput,
  Image,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import {Button} from 'react-native-elements';
import {Session} from '@supabase/supabase-js';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import Feather from 'react-native-vector-icons/Feather';
import locationService from '../services/location.service';
import imagesHelper from '../helpers/images.helper';
import { ImagePickerResponse, launchCamera } from "react-native-image-picker";
import ImageResizer from "@bam.tech/react-native-image-resizer";
import imageRepository from "../repository/image.repository";

export default function Account({route}: {params: {session: Session}} | any) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarName, setAvatarName] = useState('');
  const [email, setEmail] = useState('');
  const [images, setImages] = useState<ImagePickerResponse[]>([]);
  const [resizedImages, setResizedImages] = useState<[] | any>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [selectedItem, setSelectedItem] = useState<
    | {
        title: string;
        id: string;
        latitude: number;
        longitude: number;
        cityName: string;
      }
    | any
  >({
    id: '',
    title: '',
    latitude: 0,
    longitude: 0,
    cityName: '',
  });

  const session = route.params.session;

  useEffect(() => {
    console.log(route.params.session.user);
    if (session) {
      getProfile();
    }
  }, [session]);

  async function getProfile() {
    console.log('getProfile');
    try {
      setLoading(true);
      if (!session?.user) {
        throw new Error('No user on the session!');
      }

      let {data, error, status} = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name, location')
        .eq('id', session?.user.id)
        .single();
      console.log('data', data);
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setEmail(session?.user.email);
        setSelectedItem({
          cityName: data.location.cityName,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        });
        setAvatarUrl(imagesHelper.getPublicUrlByImageName(data.avatar_url));
        setAvatarName(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) {
        console.log('No user on the session!');
      }

      if (selectedItem.cityName === '') {
        console.log('Please select a city');
      } else {
        //Update image profile
        let img = '';
        if(resizedImages.length > 0){
          const avatar = imageRepository.uploadImage(
            resizedImages[0],
            session?.user.id + '/avatar/',
          );
          const res = await avatar;
          console.log('res', res);
          setAvatarName(res);
          img = res;
        }
        const updates = {
          username: username,
          updated_at: new Date(),
          location: {
            cityName: selectedItem.cityName,
            latitude: selectedItem.latitude,
            longitude: selectedItem.longitude,
          },
          avatar_url: img !== '' ? img : avatarName,
        };

        console.log('updates', updates);

        const {data} = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', session?.user.id)
          .select();

        console.log(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [suggestionsList, setSuggestionsList] = useState<
    {id: string; title: string}[]
  >([]);
  const getSuggestions = useCallback(async (q: string) => {
    const filterToken = q.toLowerCase();
    setCurrentSearch(filterToken);
    if (q.length < 3) {
      setSuggestionsList([]);
      setSelectedItem({
        cityName: '',
        id: '',
        latitude: 0,
        longitude: 0,
        title: '',
      });
      return;
    }
    setLoading(true);
    const suggestions = await locationService.getCitiesBySearch(filterToken);
    setSuggestionsList(suggestions);
    setLoading(false);
  }, []);

  const onClearPress = useCallback(() => {
    setSuggestionsList([]);
    setSelectedItem({
      cityName: '',
      id: '',
      latitude: 0,
      longitude: 0,
      title: '',
    });
    setCurrentSearch('');
  }, []);
  const resize = async (newTab: ImagePickerResponse[]) => {
    let neww = [];
    for (const image of newTab) {
      if (!image || !image.assets) {
        return;
      }

      try {
        let result = await ImageResizer.createResizedImage(
          String(image.assets[0].uri),
          1200,
          1200,
          'PNG',
          100,
          0,
          undefined,
          false,
          {
            mode: 'contain',
            onlyScaleDown: true,
          },
        );
        neww = [...resizedImages, result];
        console.log('result', neww);
      } catch (err) {
        console.log('Unable to resize the photo');
      }
    }
    setAvatarUrl(neww[0].uri);
    setResizedImages(neww);
  };
  async function initMediaPicker() {
    const result = await launchCamera({mediaType: 'photo'});

    if (!result.didCancel) {
      let newTab = [...images, result];
      setImages([...newTab]);
      await resize([...newTab]);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.Header} onPress={() => navigation.goBack()}>
        <IconAnt style={styles.Icon} name="arrowleft" size={24} color="#000" />
        <View style={styles.containerHeaderInfos}>
          <Text style={styles.BackText}>Mise à jour du profil</Text>
        </View>
      </Pressable>
      <Pressable style={styles.ContainerImage} onPress={initMediaPicker}>
        <View
          style={styles.ImageBackground}>
          {avatarUrl != null && avatarUrl !== '' && (
            <Image
              style={styles.Image}
              source={{uri: avatarUrl}}
            />
          )}
        </View>
      </Pressable>
      <Text style={styles.Title}>Email</Text>
      <TextInput style={styles.input} value={email} />
      <Text style={styles.Title}>Username</Text>
      <TextInput
        style={styles.input}
        value={username || ''}
        onChangeText={text => setUsername(text)}
      />
      <Text style={styles.Title}>Localisation</Text>
      <View style={[Platform.select({ios: {zIndex: 1}})]}>
        <AutocompleteDropdown
          initialValue={'test'}
          direction={Platform.select({ios: 'down'})}
          dataSet={suggestionsList}
          onChangeText={getSuggestions}
          onSelectItem={item => {
            item && setSelectedItem(item);
          }}
          debounce={600}
          suggestionsListMaxHeight={Dimensions.get('window').height * 0.4}
          onClear={onClearPress}
          loading={loading}
          useFilter={false} // set false to prevent rerender twice
          textInputProps={{
            placeholder: selectedItem?.cityName || 'Localisation...',
            placeholderTextColor: '#363636',
            autoCorrect: true,
            autoCapitalize: 'none',
            style: {
              backgroundColor: '#F6F6F6',
              height: 48,
              paddingLeft: 20,
              borderRadius: 4,
              borderColor: '#E8E8E8',
              borderWidth: 1,
              marginBottom: 8,
              color: '#363636',
              fontWeight: 'normal',
              fontSize: 14,
            },
          }}
          rightButtonsContainerStyle={{
            backgroundColor: '#F6F6F6',
            height: 47,
            marginTop: 1,
            marginRight: 1,
          }}
          inputContainerStyle={{
            borderRadius: 4,
            backgroundColor: '#F6F6F6',
            height: 47,
          }}
          suggestionsListContainerStyle={{
            backgroundColor: 'white',
            maxHeight: 165,
          }}
          containerStyle={{
            flexGrow: 1,
            flexShrink: 1,
            marginBottom: 16,
            borderColor: '#E8E8E8',
            height: 50,
            borderWidth: 1,
            borderRadius: 4,
          }}
          renderItem={item => <Text style={{padding: 15}}>{item.title}</Text>}
          EmptyResultComponent={
            <View>
              {currentSearch.length > 0 && (
                <Text style={{padding: 15}}>Aucun résultat</Text>
              )}
            </View>
          }
          ChevronIconComponent={
            <Feather name="chevron-down" size={20} color="#000" />
          }
          ClearIconComponent={
            <Feather name="x-circle" size={18} color="#000" />
          }
          inputHeight={50}
          showChevron={false}
          closeOnBlur={false}
        />
        <View style={{width: 10}} />
      </View>
      <Button
        title={loading ? 'Loading ...' : 'Update'}
        onPress={() => updateProfile()}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  Header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingBottom: 20,
  },
  containerHeaderInfos: {
    flexDirection: 'column',
  },
  BackSecond: {
    color: '#000',
    fontFamily: 'Roboto',
    fontSize: 12,
  },
  BackText: {
    color: '#000',
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  Icon: {
    marginRight: 10,
  },
  Title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  container: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  input: {
    color: '#000',
    height: 50,
    backgroundColor: '#F6F6F6',
    paddingLeft: 20,
    width: '100%',
    borderRadius: 4,
    borderColor: '#E8E8E8',
    borderWidth: 1,
    marginBottom: 12,
  },
  ContainerImage: {
    alignItems: 'center',
  },
  ImageBackground: {
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  Image: {
    width: 140,
    height: 140,
    borderRadius: 100,
  },
});
