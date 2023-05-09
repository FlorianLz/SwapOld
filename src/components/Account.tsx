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
  SafeAreaView,
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

  const [session, setSession] = useState<Session | null | any>(
    route.params.session,
  );

  /**
   * Si la session change, on appelle la fonction getProfile()
   */

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async function getProfile() {
    try {
      setLoading(true);
      // Vérifie si un utilisateur est connecté
      if (!session?.user) {
        throw new Error("Aucun utilisateur n'est connecté !");
      }

      // Récupère le profil de l'utilisateur connecté depuis la table 'profiles'
      let {data, error, status} = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name, location')
        .eq('id', session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      // Met à jour les valeurs d'état avec les données récupérées
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
    } catch (err) {
      if (err instanceof Error) {
        // Affiche une alerte avec le message d'erreur
        Alert.alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Cette fonction asynchrone permet de mettre à jour le profil utilisateur.
   * Elle prend en compte la mise à jour de l'email, du mot de passe, de la ville,
   * de l'image de profil, et du nom d'utilisateur.
   */
  async function updateProfile() {
    setLoading(true); // Mettre le statut de chargement à true.

    // Mettre à jour l'email.
    if (authHelper.checkEmailIsValid(email)) {
      // Vérifier si l'email est valide.
      const update = await supabase.rpc('update_user_email', {
        user_id: session?.user.id,
        new_email: email,
      }); // Appeler la procédure stockée pour mettre à jour l'email.

      // Gérer les erreurs liées à la mise à jour de l'email.
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
        // Mettre à jour le mot de passe.
        if (
          password !== '' &&
          passwordConfirm !== '' &&
          password === passwordConfirm &&
          authHelper.checkPasswordIsValid(password)
        ) {
          // Vérifier si les mots de passe sont identiques et valides.
          const updatePassword = await supabase.rpc('update_user_password', {
            user_id: session?.user.id,
            new_password: password,
          }); // Appeler la procédure stockée pour mettre à jour le mot de passe.

          // Gérer les erreurs liées à la mise à jour du mot de passe.
          if (updatePassword.error) {
            setError(
              'Une erreur est survenue lors de la mise à jour de votre mot de passe',
            );
          } else {
            // Mettre à jour le reste du profil.
            if (selectedItem.cityName === '') {
              setError('Veuillez renseigner votre ville');
              setLoading(false);
            } else {
              // Mettre à jour l'image de profil.
              let img: boolean | string = '';
              if (resizedImages.length > 0) {
                const avatar = imageRepository.uploadImage(
                  resizedImages[0],
                  session?.user.id + '/avatar/',
                ); // Télécharger l'image de profil sur le serveur.
                const res: any = await avatar;
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

              const {error: err} = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session?.user.id)
                .select(); // Mettre à jour le profil dans la base de données.

              // Gérer les erreurs liées à la mise à jour du profil.
              if (err) {
                setError(
                  'Une erreur est survenue lors de la mise à jour de votre profil',
                );
              } else {
                navigation.goBack(); // Revenir à l'écran précédent.
              }
              setLoading(false); // Mettre le statut de chargement à false.
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
            if (selectedItem.cityName === '') {
              // Si le nom de la ville sélectionnée est vide, afficher un message d'erreur
              setError('Veuillez renseigner votre ville');
              setLoading(false);
            } else {
              // Mettre à jour l'image de profil
              let img: boolean | string = '';
              if (resizedImages.length > 0) {
                // Si l'utilisateur a téléchargé une nouvelle image de profil, la mettre à jour
                const avatar = imageRepository.uploadImage(
                  resizedImages[0],
                  session?.user.id + '/avatar/',
                );
                const res: any = await avatar;
                setAvatarName(res);
                img = res;
              }
              // Créer un objet avec les mises à jour à effectuer sur le profil
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
              // Envoyer la mise à jour à Supabase
              const {error: err} = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session?.user.id)
                .select();
              if (err) {
                // S'il y a une erreur lors de la mise à jour, afficher un message d'erreur
                setError(
                  'Une erreur est survenue lors de la mise à jour de votre profil',
                );
              } else {
                // Si la mise à jour est réussie, rafraîchir la session utilisateur et revenir à la page précédente
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

  /**
   * Cette fonction récupère les suggestions de villes en fonction d'une chaîne de caractères `q`.
   * Si `q` est inférieure à 3 caractères, la liste des suggestions est vidée et un objet vide est sélectionné.
   * La fonction appelle le service de localisation pour récupérer les suggestions de villes correspondant à la chaîne de caractères.
   * @param {string} q - La chaîne de caractères pour laquelle récupérer les suggestions de villes.
   */
  const getSuggestions = useCallback(async (q: string) => {
    // Convertir la chaîne de recherche en minuscules pour la comparer aux suggestions
    const filterToken = q.toLowerCase();
    // Enregistrer la chaîne de recherche actuelle dans l'état local
    setCurrentSearch(filterToken);
    if (q.length < 3) {
      // Si la chaîne de recherche est trop courte, vider la liste de suggestions et l'élément sélectionné
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
    // Afficher une icône de chargement pendant que les suggestions sont récupérées
    setLoading(true);
    // Récupérer les suggestions auprès du service de localisation
    const suggestions = await locationService.getCitiesBySearch(filterToken);
    // Enregistrer les suggestions dans l'état local et désactiver l'icône de chargement
    setSuggestionsList(suggestions);
    setLoading(false);
  }, []);

  /**
   * Cette fonction est appelée lorsqu'on appuie sur le bouton "Effacer".
   * Elle vide la liste des suggestions et sélectionne un objet vide.
   */
  const onClearPress = useCallback(() => {
    // Vider la liste de suggestions et l'élément sélectionné
    setSuggestionsList([]);
    setSelectedItem({
      cityName: '',
      id: '',
      latitude: 0,
      longitude: 0,
      title: '',
    });
    // Vider la chaîne de recherche actuelle
    setCurrentSearch('');
  }, []);

  /**
   * Redimensionne les images sélectionnées par l'utilisateur avec ImageResizer.
   * @param {ImagePickerResponse[]} newTab - Tableau contenant les images sélectionnées par l'utilisateur.
   */
  const resize = async (newTab: ImagePickerResponse[]) => {
    let ResizeImage: any[] = [];

    // Parcourir toutes les images sélectionnées
    for (const image of newTab) {
      // Vérifier si l'image est valide
      if (!image || !image.assets) {
        return;
      }

      try {
        // Redimensionner l'image avec les dimensions et les options spécifiées
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
        ResizeImage = [...resizedImages, result];
      } catch (err) {
        // Gérer les erreurs de redimensionnement d'image
        setError('Impossible de redimensionner la photo');
      }
    }
    // Enregistrer l'URL de l'image redimensionnée dans l'état local
    setAvatarUrl(ResizeImage[0].uri);
    // Enregistrer les images redimensionnées dans l'état local
    setResizedImages(ResizeImage);
  };

  /**
   * Initialise la caméra pour prendre une photo et ajoute la nouvelle image dans le state "images".
   * Puis, redimensionne toutes les images présentes dans le state "images".
   */
  async function initMediaPicker() {
    // Ouvre l'appareil photo pour prendre une photo
    const result = await launchCamera({mediaType: 'photo'});

    // Si l'utilisateur n'a pas annulé la prise de photo
    if (!result.didCancel) {
      // Copie le tableau d'images existant et ajoute la nouvelle photo
      let newTab = [...images, result];
      setImages([...newTab]);

      // Redimensionne les images et met à jour les états correspondants
      await resize([...newTab]);
    }
  }

  /**
   * Mis à jour du profil
   */

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Pressable
          style={styles.Header}
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <IconAnt
            style={styles.Icon}
            name="arrowleft"
            size={24}
            color="#000"
          />
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
              renderItem={item => (
                <Text style={{padding: 15}}>{item.title}</Text>
              )}
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
    </SafeAreaView>
  );
}

/**
 * Styles
 */

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
    fontFamily: 'System',
    fontSize: 12,
  },
  BackText: {
    color: '#000',
    fontFamily: 'System',
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
    fontFamily: 'System',
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
