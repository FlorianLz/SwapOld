import {Image, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import articleService from '../services/article.service';
import {IArticleData} from '../interfaces/articleInterface';
import {supabase} from '../lib/initSupabase';
import { Screen, ScreenContainer } from "react-native-screens";
export default function Home() {
  const [articles, setArticles] = useState<IArticleData[] | []>([]);

  useEffect(() => {
    articleService.getAllArticles().then(resul => {
      setArticles(resul as IArticleData[]);
    });
  }, []);

  return (
    <View>
      <Text>Home</Text>
      {articles.map(article => (
        <React.Fragment key={article.id}>
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
        </React.Fragment>
      ))}
    </View>
  );
}
