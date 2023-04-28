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
  Modal,
  ScrollView,
} from 'react-native';
import {Session} from '@supabase/supabase-js';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import Feather from 'react-native-vector-icons/Feather';
import locationService from '../services/location.service';
import imagesHelper from '../helpers/images.helper';
import {ImagePickerResponse, launchCamera} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import imageRepository from '../repository/image.repository';
import authHelper from '../helpers/auth.helper';
import {KeyboardAvoidingView} from 'react-native';

export default function Account({route}: {params: {session: Session}} | any) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarName, setAvatarName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [images, setImages] = useState<ImagePickerResponse[]>([]);
  const [resizedImages, setResizedImages] = useState<[] | any>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [modalChoiceVisible, setModalChoiceVisible] = useState(false);
  const [error, setError] = useState('');
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

  const [session, setSession] = useState<Session | null>(route.params.session);

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
    setLoading(true);
    //Update email
    if (authHelper.checkEmailIsValid(email)) {
      const update = await supabase.rpc('update_user_email', {
        user_id: session?.user.id,
        new_email: email,
      });
      if (update.error) {
        switch (update.error.code) {
          case '23505':
            setError('Cet email est déjà utilisé');
            break;
          default:
            setError(
              'Une erreur est survenue lors de la mise à jour de votre email',
            );
            break;
        }
      } else {
        //Update password
        if (
          password !== '' &&
          passwordConfirm !== '' &&
          password === passwordConfirm &&
          authHelper.checkPasswordIsValid(password)
        ) {
          const updatePassword = await supabase.rpc('update_user_password', {
            user_id: session?.user.id,
            new_password: password,
          });
          if (updatePassword.error) {
            setError(
              'Une erreur est survenue lors de la mise à jour de votre mot de passe',
            );
          } else {
            //Update reste du profil
            if (selectedItem.cityName === '') {
              setError('Veuillez renseigner votre ville');
              setLoading(false);
            } else {
              //Update image profile
              let img = '';
              if (resizedImages.length > 0) {
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

              const {error: err} = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session?.user.id)
                .select();
              if (err) {
                setError(
                  'Une erreur est survenue lors de la mise à jour de votre profil',
                );
              } else {
                navigation.goBack();
              }
              setLoading(false);
            }
          }
        } else {
          if (password !== '') {
            if (!authHelper.checkPasswordIsValid(password)) {
              setError(
                'Le mot de passe doit contenir au moins 8 caractères dont une majuscule, une minuscule, un caractère spécial et un chiffre.',
              );
            } else {
              setError('Les mots de passe ne sont pas identiques.');
            }
          } else {
            //Update reste du profil
            if (selectedItem.cityName === '') {
              setError('Veuillez renseigner votre ville');
              setLoading(false);
            } else {
              //Update image profile
              let img = '';
              if (resizedImages.length > 0) {
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

              const {error: err} = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session?.user.id)
                .select();
              if (err) {
                setError(
                  'Une erreur est survenue lors de la mise à jour de votre profil',
                );
                console.log(err.message);
              } else {
                const auth = await supabase.auth.refreshSession();
                setSession(auth.data.session);
                navigation.goBack();
              }
              setLoading(false);
            }
          }
        }
      }
    } else {
      setError("Votre Email n'est pas valide");
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
      <Pressable
        style={styles.Header}
        onPress={() => navigation.goBack()}
        disabled={loading}>
        <IconAnt style={styles.Icon} name="arrowleft" size={24} color="#000" />
        <View style={styles.containerHeaderInfos}>
          <Text style={styles.BackText}>Mise à jour du profil</Text>
        </View>
      </Pressable>
      <ScrollView style={styles.ScrollView}>
        <Pressable style={styles.ContainerImage} onPress={initMediaPicker}>
          <View style={styles.ImageBackground}>
            {avatarUrl != null && avatarUrl !== '' && (
              <Image style={styles.Image} source={{uri: avatarUrl}} />
            )}
          </View>
        </Pressable>
        <Text style={styles.Title}>Email</Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={text => setEmail(text)}
          />
        </KeyboardAvoidingView>
        <Text style={styles.Title}>Nom d'utilisateur</Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TextInput
            style={styles.input}
            value={username || ''}
            onChangeText={text => setUsername(text)}
          />
        </KeyboardAvoidingView>
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
        </View>
        <Text style={styles.Title}>Mot de passe</Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TextInput
            style={styles.input}
            value={password || ''}
            onChangeText={text => setPassword(text)}
            secureTextEntry={true}
          />
        </KeyboardAvoidingView>
        <Text style={styles.Title}>Confirmation du mot de passe</Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TextInput
            style={styles.input}
            value={passwordConfirm || ''}
            onChangeText={text => setPasswordConfirm(text)}
            secureTextEntry={true}
          />
        </KeyboardAvoidingView>
        <View style={{width: 10}} />

        {error !== '' && (
          <>
            <View style={styles.errorMessage}>
              <Text style={styles.errorMessageText}>{error}</Text>
            </View>
          </>
        )}
        <Pressable
          style={styles.Button}
          onPress={() => {
            console.log('edit');
            setModalChoiceVisible(true);
          }}>
          <Text style={styles.ButtonText}>Mise à jour du profil</Text>
        </Pressable>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalChoiceVisible}
          onRequestClose={() => {
            setModalChoiceVisible(!modalChoiceVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Voulez vous modifier votre profil ?
              </Text>
              <Pressable
                style={[styles.button]}
                onPress={() => {
                  updateProfile();
                  setModalChoiceVisible(false);
                }}>
                <Text style={[styles.textStyle]}>Accepter</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalChoiceVisible(!modalChoiceVisible)}>
                <Text style={[styles.textStyle, styles.TextClose]}>
                  Annuler
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
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

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  button: {
    borderRadius: 4,
    height: 40,
    backgroundColor: '#5DB075',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    paddingTop: 8,
    width: '100%',
  },
  buttonClose: {
    backgroundColor: 'transparent',
  },
  TextClose: {
    color: '#000',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStyleSecondary: {
    color: '#5DB075',
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  ButtonTextNonDispo: {
    backgroundColor: '#F04242',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#5DB075',
  },
  Button: {
    backgroundColor: '#5DB075',
    height: 60,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: 20,
    borderColor: 'red',
    borderWidth: 1,
    minHeight: 50,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  errorMessageText: {
    color: 'red',
    textAlign: 'center',
  },
  ScrollView: {
    marginBottom: 50,
  },
});
