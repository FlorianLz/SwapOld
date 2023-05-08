import React, {useCallback, useEffect} from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Text} from 'react-native-elements';
import {useState} from 'react';
import articleRepository from '../../repository/article.repository';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ImagePickerResponse, launchCamera} from 'react-native-image-picker';
import imageService from '../../services/image.service';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import locationService from '../../services/location.service';
import Feather from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconIco from 'react-native-vector-icons/Ionicons';

Feather.loadFont();

export default function AddArticle({
  route,
}:
  | {
      params: {
        session: object;
        id: number;
        privateArticle: boolean;
        article_sender: any;
        hideRetour: boolean;
      };
    }
  | any) {
  const {session} = route.params;
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [images, setImages] = useState<ImagePickerResponse[]>([]);
  const [resizedImages, setResizedImages] = useState<[] | any>([]);
  const [published, setPublished] = useState<boolean>(false);
  const [onPublication, setOnPublication] = useState<boolean>(false);
  const [msgPublished, setMsgPublished] = useState<string>('');
  const privateArticle = route.params.privateArticle || false;
  const article_sender = route.params.article_sender || null;
  const hideRetour = route.params.hideRetour || false;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const isFocused = useIsFocused();

  /**
   * Réinitialise les valeurs du formulaire d'article.
   * Cette fonction est déclenchée à chaque fois que l'auteur d'article change ou que la page est rechargée.
   */
  useEffect(() => {
    setImages([]);
    setResizedImages([]);
    setTitle('');
    setContent('');
    setSelectedItem(null);
    setPublished(false);
    setOnPublication(false);
    setMsgPublished('');
    setError('');
  }, [article_sender, isFocused]);

  /**
   * Redimensionne les images sélectionnées par l'utilisateur avec ImageResizer.
   * @param {ImagePickerResponse[]} newTab - Tableau contenant les images sélectionnées par l'utilisateur.
   */
  const resize = async (newTab: ImagePickerResponse[]) => {
    // Initialise un tableau vide pour stocker les images redimensionnées.
    let resizeImage: any[] = [];

    // Boucle à travers chaque élément de newTab.
    for (const image of newTab) {
      // Vérifie si l'image est définie et si elle possède des informations sur les ressources.
      if (!image || !image.assets) {
        return;
      }

      try {
        // Redimensionne l'image avec ImageResizer.
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

        // Ajoute l'image redimensionnée au tableau resizeImage.
        resizeImage = [...resizedImages, result];
      } catch (err) {
        // Gère les erreurs lors du redimensionnement de l'image.
        setError('Impossible de redimensionner la photo');
      }
    }

    // Met à jour le tableau des images redimensionnées.
    setResizedImages(resizeImage);
  };

  /**
   * Gère la soumission d'un article à publier, y compris les images associées.
   */
  function handleUpload() {
    // Vérifie que tous les champs nécessaires ont été remplis.
    if (
      title === '' ||
      content === '' ||
      selectedItem === null ||
      images.length === 0
    ) {
      setError('Veuillez remplir tous les champs');
    } else {
      // Déclenche l'affichage du message de publication.
      setOnPublication(true);
      setError('');

      // Appelle la méthode d'ajout d'article de l'API.
      articleRepository
        .addArticle(
          session.user.id,
          title,
          content,
          selectedItem,
          privateArticle,
        )
        .then(async (result: any) => {
          if (!result.error) {
            let errorDuringUpload = false;

            // Boucle à travers chaque image redimensionnée et la télécharge sur le serveur.
            for (const image of resizedImages) {
              const add = await imageService.uploadImage(
                image,
                result.id_article,
                session.user.id + '/' + result.id_article + '/',
              );

              // Gère les erreurs d'upload d'image.
              if (add.error) {
                errorDuringUpload = true;
              }
            }

            // Si l'article est privé, appelle la méthode de mise à jour correspondante.
            if (privateArticle) {
              articleRepository
                .swapArticle(
                  session.user.id,
                  typeof article_sender.article_sender !== 'undefined'
                    ? article_sender.article_sender.article.id_profile
                    : article_sender.article.id_profile,
                  typeof article_sender.article_sender !== 'undefined'
                    ? article_sender.article_sender.article.id
                    : article_sender.article.id,
                  result.id_article,
                )
                .then((data: any) => {
                  if (data.error) {
                    setError('error' + data.error + data.message);
                  }
                });
            }

            // Si aucune erreur ne s'est produite pendant l'upload des images, affiche un message de succès et redirige vers la page de profil.
            if (!errorDuringUpload) {
              setPublished(true);
              setMsgPublished(
                'Article ajouté avec succès. Vous allez être redirigé vers la liste de vos ajouts dans quelques secondes...',
              );
              setTimeout(() => {
                navigation.navigate('HomePageScreen', {screen: 'Profil'});
              }, 4000);

              // Sinon, affiche un message d'erreur et redirige vers la page de modification de l'article.
            } else {
              setPublished(true);
              setMsgPublished(
                "Une erreur est survenue lors de l'upload des images. Vous allez être redirigé vers la page de modification de l'article dans quelques secondes...",
              );
              setTimeout(() => {
                navigation.navigate('HomePageScreen', {screen: 'Profil'});
              }, 4000);
            }

            // Gère les erreurs lors de l'ajout de l'article.
          } else {
            setError("Un problème est survenu lors de l'ajout de l'article");
            setOnPublication(false);
          }
        });
    }
  }

  function handleDeleteImage(index: number) {
    // Cette fonction prend en entrée un index qui correspond à l'indice de l'image à supprimer dans le tableau "resizedImages"
    const newImages = resizedImages.filter(
      (img: any, i: number) => i !== index,
    );
    // Elle utilise la méthode "filter" pour créer un nouveau tableau "newImages" qui ne contient pas l'image correspondant à l'indice donné en entrée
    setResizedImages([...newImages]);
    // Enfin, elle met à jour le tableau "resizedImages" en y remplaçant son contenu par celui du tableau "newImages". Ainsi, cette fonction permet de supprimer une image du tableau "resizedImages".
  }

  /**
   * Initialise la caméra pour prendre une photo et ajoute la nouvelle image dans le state "images".
   * Puis, redimensionne toutes les images présentes dans le state "images".
   */
  async function initMediaPicker() {
    // Lance la caméra pour prendre une photo
    const result = await launchCamera({mediaType: 'photo'});

    // Si l'utilisateur n'a pas annulé la prise de photo
    if (!result.didCancel) {
      // Ajoute la nouvelle image dans le state "images"
      let newTab = [...images, result];
      setImages([...newTab]);

      // Redimensionne toutes les images présentes dans le state "images"
      await resize([...newTab]);
    }
  }

  const [loading, setLoading] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [suggestionsList, setSuggestionsList] = useState<
    {id: string; title: string}[]
  >([]);
  const [selectedItem, setSelectedItem] = useState<
    | {
        title: string;
        id: string;
        latitude: number;
        longitude: number;
        cityName: string;
      }
    | unknown
  >({
    id: '',
    title: '',
    latitude: 0,
    longitude: 0,
    cityName: '',
  });

  /**
   * Récupère les suggestions de villes en fonction de la chaîne de recherche entrée par l'utilisateur.
   * @param {string} q - La chaîne de recherche entrée par l'utilisateur.
   * @returns {Promise<void>} - Une promesse qui résout lorsque les suggestions de villes sont récupérées.
   */
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

  /**
   * Efface la liste des suggestions et remet les valeurs par défaut pour l'élément sélectionné et la recherche en cours.
   */
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

  /**
   * Affiche un formulaire pour ajouter un nouvelle article.
   */

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {!hideRetour ? (
          <Pressable
            style={styles.Header}
            onPress={() => {
              navigation.navigate('SingleArticle', {
                id:
                  typeof article_sender.article_sender !== 'undefined'
                    ? article_sender.article_sender.article.id
                    : article_sender.article.id,
                article_sender: article_sender,
              });
            }}>
            <IconAnt
              style={styles.BackIcon}
              name="arrowleft"
              size={24}
              color="#000"
            />
            <Text h4 style={styles.backTitle}>
              Publier un article
            </Text>
          </Pressable>
        ) : (
          <Text h4 style={styles.title}>
            Publier un article
          </Text>
        )}
        <View
          style={{
            position: 'relative',
            zIndex: 100,
            minHeight: '80%',
            backgroundColor: '#fff',
          }}>
          <Text style={styles.Title}>Titre de l'article</Text>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <TextInput
              style={styles.input}
              placeholder="Tee shirt blanc..."
              placeholderTextColor="#BDBDBD"
              value={title}
              onChangeText={setTitle}
              maxLength={40}
            />
          </KeyboardAvoidingView>

          <Text style={styles.Title}>Description de l'article</Text>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <TextInput
              style={styles.input}
              placeholder="Description..."
              placeholderTextColor="#BDBDBD"
              value={content}
              onChangeText={setContent}
            />
          </KeyboardAvoidingView>

          <Text style={styles.Title}>Localisation</Text>
          <View style={[Platform.select({ios: {zIndex: 1}})]}>
            <AutocompleteDropdown
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
                placeholder: 'Localisation...',
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
                  color: '#BDBDBD',
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
                zIndex: 100,
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
            <View style={{width: 10}} />
          </View>

          <Text style={styles.Title}>
            Photos de l’article ({resizedImages.length}/5)
          </Text>

          {resizedImages.length > 0 ? (
            <View style={styles.ContainerAddImage}>
              {resizedImages.map(
                (image: {uri: string}, index: React.Key | null | undefined) => (
                  <View key={index}>
                    {image && (
                      <View style={styles.containerIcon}>
                        <Image
                          key={index}
                          source={{uri: image.uri}}
                          style={styles.Image}
                        />
                        <Pressable
                          style={[styles.ButtonDelete, styles.bgWhite]}
                          onPress={() => handleDeleteImage(index as number)}>
                          <IconIco
                            style={[styles.Icon]}
                            name="close"
                            size={18}
                            color="#000"
                          />
                        </Pressable>
                      </View>
                    )}
                  </View>
                ),
              )}
              {resizedImages.length < 5 && (
                <Pressable
                  style={styles.Button}
                  onPress={initMediaPicker}
                  disabled={resizedImages.length > 4}>
                  <IconIco
                    style={styles.Icon}
                    name="add-circle-outline"
                    size={45}
                    color="#000"
                  />
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{backgroundColor: 'white'}}>
              <Pressable
                style={styles.Button}
                onPress={initMediaPicker}
                disabled={resizedImages.length > 4}>
                <IconIco
                  style={styles.Icon}
                  name="add-circle-outline"
                  size={45}
                  color="#000"
                />
              </Pressable>
            </View>
          )}
          <View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {onPublication && !published && (
              <Text style={styles.base}>
                Publication en cours, veuillez patienter...
              </Text>
            )}
            {published && <Text style={styles.success}>{msgPublished}</Text>}
          </View>
        </View>
        <View style={styles.containerAddArticle}>
          {!onPublication && !published && (
            <Pressable
              style={styles.ButtonAddArticle}
              onPress={handleUpload}
              disabled={onPublication}>
              <Text style={styles.ButtonText}>Publier cet article</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * STYLES
 */

const styles = StyleSheet.create({
  Header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    marginBottom: 20,
  },
  backTitle: {
    color: '#000',
    fontFamily: 'System',
    fontSize: 12,
  },
  BackIcon: {
    marginRight: 10,
  },
  container: {
    marginLeft: 20,
    marginRight: 20,
    position: 'relative',
    height: '100%',
  },
  input: {
    backgroundColor: '#F6F6F6',
    height: 50,
    paddingLeft: 20,
    borderRadius: 4,
    borderColor: '#E8E8E8',
    borderWidth: 1,
    marginBottom: 8,
    fontWeight: 'normal',
  },
  Title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  Button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  Icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
    marginLeft: 2,
  },
  Image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  ContainerAddImage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'white',
    position: 'relative',
    zIndex: 10,
  },
  ButtonAddArticle: {
    height: 50,
    backgroundColor: '#5DB075',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 20,
    position: 'relative',
    zIndex: 0,
  },
  ButtonText: {
    color: 'white',
    display: 'flex',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerAddArticle: {
    position: 'absolute',
    bottom: 8,
    width: '100%',
    zIndex: 0,
  },
  error: {
    color: 'red',
    paddingTop: 10,
  },
  success: {
    color: '#5DB075',
    paddingTop: 10,
  },
  base: {
    color: '#000',
    paddingTop: 10,
  },
  title: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 20,
  },
  ButtonDelete: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  containerIcon: {
    position: 'relative',
  },
  bgWhite: {
    backgroundColor: 'white',
    borderRadius: 150,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    marginRight: 3,
    marginLeft: 0,
  },
});
