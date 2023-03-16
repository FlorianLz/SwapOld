import React, {useCallback} from 'react';
import {
  Button,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useState} from 'react';
import articleRepository from '../../repository/article.repository';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ImagePickerResponse, launchCamera} from 'react-native-image-picker';
import imageService from '../../services/image.service';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import locationService from '../../services/location.service';
import Feather from 'react-native-vector-icons/Feather';

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
  console.log('article_sender', article_sender);
  const maxImages = 5;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  console.log('private', privateArticle);
  console.log('sender', article_sender);
  const resize = async (newTab: ImagePickerResponse[]) => {
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
        let neww = [...resizedImages, result];
        setResizedImages(neww);
      } catch (err) {
        console.log('Unable to resize the photo');
      }
    }
  };

  function handleUpload() {
    if (
      title === '' ||
      content === '' ||
      selectedItem === null ||
      images.length === 0
    ) {
      setError('Veuillez remplir tous les champs');
    } else {
      setOnPublication(true);
      setError('');
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
            for (const image of resizedImages) {
              const add = await imageService.uploadImage(
                image,
                result.id_article,
                session.user.id + '/' + result.id_article + '/',
              );
              if (add.error) {
                errorDuringUpload = true;
              }
            }
            if (privateArticle) {
              articleRepository
                .swapArticle(
                  session.user.id,
                  article_sender.article.id_profile,
                  article_sender.article.id,
                  result.id_article,
                )
                .then((result: any) => {
                  if (result.error) {
                    console.log('error', result.error);
                  }
                });
            }
            if (!errorDuringUpload) {
              setPublished(true);
              setMsgPublished(
                'Article ajouté avec succès. Vous allez être redirigé vers la liste de vos ajouts dans quelques secondes...',
              );
              setTimeout(() => {
                navigation.navigate('HubPublication');
              }, 4000);
            } else {
              setPublished(true);
              //Rediriger vers la page de modification de l'article
              setMsgPublished(
                "Une erreur est survenue lors de l'upload des images. Vous allez être redirigé vers la page de modification de l'article dans quelques secondes...",
              );
              setTimeout(() => {
                navigation.navigate('HubPublication');
              }, 4000);
            }
          } else {
            setError("Un problème est survenu lors de l'ajout de l'article");
            setOnPublication(false);
          }
        });
    }
  }

  async function initMediaPicker() {
    const result = await launchCamera({mediaType: 'photo'});
    console.log(result);

    if (!result.didCancel) {
      if (images.length <= maxImages) {
        let newTab = [...images, result];
        setImages(newTab);
        await resize(newTab);
      }
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

  const getSuggestions = useCallback(async (q: string) => {
    const filterToken = q.toLowerCase();
    setCurrentSearch(filterToken);
    console.log('getSuggestions', q);
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

  return (
    <View style={{flexGrow: 1}}>
      <View style={styles.container}>
        <Text style={styles.title}>Ajouter un article</Text>
        <TextInput
          style={styles.input}
          placeholder="Titre"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Contenu"
          value={content}
          onChangeText={setContent}
        />

        {resizedImages.length > 0 && (
          <View>
            <Text>Photos</Text>
            {resizedImages.map(
              (image: {uri: string}, index: React.Key | null | undefined) => (
                <React.Fragment key={index}>
                  {image && (
                    <Image
                      key={index}
                      source={{uri: image.uri}}
                      style={{width: 200, height: 200}}
                    />
                  )}
                </React.Fragment>
              ),
            )}
          </View>
        )}

        <View
          style={[
            {flex: 1, flexDirection: 'row', alignItems: 'center'},
            Platform.select({ios: {zIndex: 1}}),
          ]}>
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
              placeholder: 'Rechercher...',
              autoCorrect: true,
              autoCapitalize: 'none',
              style: {
                borderRadius: 25,
                paddingLeft: 18,
              },
            }}
            rightButtonsContainerStyle={{
              right: 8,
              height: 30,

              alignSelf: 'center',
            }}
            inputContainerStyle={{
              borderRadius: 25,
            }}
            suggestionsListContainerStyle={{
              backgroundColor: 'white',
            }}
            containerStyle={{flexGrow: 1, flexShrink: 1}}
            renderItem={item => <Text style={{padding: 15}}>{item.title}</Text>}
            EmptyResultComponent={
              <View>
                {currentSearch.length > 0 && (
                  <Text style={{padding: 15}}>Aucun résultat</Text>
                )}
              </View>
            }
            ChevronIconComponent={
              <Feather name="chevron-down" size={20} color="#fff" />
            }
            ClearIconComponent={
              <Feather name="x-circle" size={18} color="#fff" />
            }
            inputHeight={50}
            showChevron={false}
            closeOnBlur={false}
          />
          <View style={{width: 10}} />
        </View>
        <Text style={{color: '#668', fontSize: 13}}>
          Selected item id: {JSON.stringify(selectedItem)}
        </Text>

        <ScrollView>
          <Button
            title={'Ajouter photo'}
            onPress={initMediaPicker}
            disabled={resizedImages.length > 4}
          />
          <Button
            title="Ajouter"
            onPress={handleUpload}
            disabled={onPublication}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {onPublication && !published && (
            <Text>Publication en cours, veuillez patienter...</Text>
          )}
          {published && <Text>{msgPublished}</Text>}
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 12,
  },
  input: {
    height: 40,
    width: 200,
    marginBottom: 12,
    borderWidth: 1,
  },
  error: {
    color: 'red',
  },
});
