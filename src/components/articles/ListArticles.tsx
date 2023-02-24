import {Image, StyleSheet, Text, View, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
import articleService from '../../services/article.service';
import {supabase} from '../../lib/initSupabase';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {IArticleData} from '../../interfaces/articleInterface';
export default function ListArticles() {
  const [articles, setArticles] = useState<IArticleData[] | []>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  useEffect(() => {
    // a supp
    // @ts-ignore
    articleService.getAllArticles().then((resul: IArticleData[]) => {
      setArticles(resul as IArticleData[]);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Home</Text>
      {articles.map(article => (
        <Pressable
          onPress={() => navigation.navigate('SingleArticle')}
          key={article.id}>
          <Text>{article.title}</Text>
          <Text>{article.description}</Text>
          <Text>Latitude : {article.location.latitude}</Text>
          <Text>Longitude : {article.location.longitude}</Text>
          <Text>
            Mis en ligne par {article.articles_profiles[0].profiles.username} le
            {' ' + new Date(article.created_at).toLocaleDateString()}
          </Text>
          {article.articles_images.map(item => (
            <React.Fragment key={item.id}>
              <Image
                source={{
                  uri: supabase.storage
                    .from('swapold')
                    .getPublicUrl(item.image_name).data.publicUrl,
                }}
                style={{width: 500, height: 200, resizeMode: 'cover'}}
              />
            </React.Fragment>
          ))}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
});
