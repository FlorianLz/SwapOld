import {Image, Pressable, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import articleService from '../services/article.service';
import {IArticleData} from '../interfaces/articleInterface';
import {supabase} from '../lib/initSupabase';

export default ({route}: {params: {session: object; id: number}} | any) => {
  const {id} = route.params;
  const [article, setArticle] = React.useState<IArticleData>(
    {} as IArticleData,
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    // a supp
    // @ts-ignore
    articleService.getArticleById(id).then((result: IArticleData) => {
      setArticle(result as IArticleData);
      setLoading(true);
    });
  }, [id]);
  return (
    <View>
      {loading ? (
        <View>
          <Text>SingleArticle</Text>
          <Text>{article.title}</Text>
          <Text>{article.description}</Text>
          <Text>Latitude : {article.location?.latitude}</Text>
          <Text>Longitude : {article.location?.longitude}</Text>
          <Text>
            Mis en ligne par {article?.articles_profiles[0].profiles.username} le
            {' ' + new Date(article?.created_at).toLocaleDateString()}
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
        </View>
      ) : null}
    </View>
  );
};
