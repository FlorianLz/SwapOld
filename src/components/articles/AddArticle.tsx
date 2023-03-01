import React from 'react';
import {
  Button,
  Image,
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

export default function AddArticle({
  route,
}: {params: {session: object; id: number}} | any) {
  const {session} = route.params;
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [images, setImages] = useState<ImagePickerResponse[]>([]);
  const [resizedImages, setResizedImages] = useState<[]>([]);
  const [published, setPublished] = useState<boolean>(false);
  const [onPublication, setOnPublication] = useState<boolean>(false);
  const [msgPublished, setMsgPublished] = useState<string>('');
  const maxImages = 5;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const resize = async (newTab: ImagePickerResponse[]) => {
    for (const image of newTab) {
      console.log('image', image);
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

        // @ts-ignore
        setResizedImages(neww);
      } catch (err) {
        console.log('Unable to resize the photo');
      }
    }
  };

  function handleUpload() {
    console.log('handleUpload');
    if (title === '' || content === '') {
      setError('Veuillez remplir tous les champs');
    } else {
      setOnPublication(true);
      setError('');
      console.log('title', title);
      console.log('content', content);
      articleRepository
        .addArticle(session.user.id, title, content)
        .then(async (result: any) => {
          console.log(result);
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

  return (
    <ScrollView>
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
            {resizedImages.map((image: {uri: string}, index) => (
              <React.Fragment key={index}>
                {image && (
                  <Image
                    key={index}
                    source={{uri: image.uri}}
                    style={{width: 200, height: 200}}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        )}
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
      </View>
    </ScrollView>
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
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
  },
  error: {
    color: 'red',
  },
});
