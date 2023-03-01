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

export default function AddArticle({
  route,
}: {params: {session: object; id: number}} | any) {
  const {session} = route.params;
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [images, setImages] = useState<ImagePickerResponse[]>([]);
  const maxImages = 5;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  function handleUpload() {
    console.log('handleUpload');
    if (title === '' || content === '') {
      setError('Veuillez remplir tous les champs');
    } else {
      setError('');
      console.log('title', title);
      console.log('content', content);
      articleRepository
        .addArticle(session.user.id, title, content)
        .then((result: any) => {
          console.log(result);
          if (!result.error) {
            //navigation.navigate('HubPublication');
            let errorDuringUpload = false;
            images.forEach(image => {
              imageService
                .uploadImage(
                  image,
                  result.id_article,
                  session.user.id + '/' + result.id_article + '/',
                )
                .then(res => {
                  if (res.error) {
                    errorDuringUpload = true;
                  }
                });
            });
            if (!errorDuringUpload) {
              navigation.navigate('HubPublication');
            } else {
              //Rediriger vers la page de modification de l'article
              navigation.navigate('HubPublication');
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
        setImages([...images, result]);
      }
    }
  }

  // @ts-ignore
  // @ts-ignore
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
        {images.length > 0 && (
          <View>
            <Text>Photos</Text>
            {images.map((image, index) => (
              <>
                {image.assets && (
                  <Image
                    key={index}
                    source={{uri: image.assets[0].uri}}
                    style={{width: 200, height: 200}}
                  />
                )}
              </>
            ))}
          </View>
        )}
        <Button title={'Ajouter photo'} onPress={initMediaPicker} />
        <Button title="Ajouter" onPress={handleUpload} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
