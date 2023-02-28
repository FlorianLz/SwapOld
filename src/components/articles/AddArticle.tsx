import React from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import {useState} from 'react';
import articleRepository from '../../repository/article.repository';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export default function AddArticle({
  route,
}: {params: {session: object; id: number}} | any) {
  const {session} = route.params;
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  function handleUpload() {
    if (title === '' || content === '') {
      setError('Veuillez remplir tous les champs');
    } else {
      setError('');
      console.log('title', title);
      console.log('content', content);
      articleRepository
        .addArticle(session.user.id, title, content)
        .then(result => {
          console.log(result);
          if (!result.error) {
            navigation.navigate('HubPublication');
          } else {
            setError("Un problème est survenu lors de l'ajout de l'article");
          }
        });
    }
  }

  return (
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
      <Button title="Ajouter" onPress={handleUpload} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
