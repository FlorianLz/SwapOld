import {
  Pressable,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import React, {useEffect} from 'react';
import articleService from '../services/article.service';
import {IArticleData} from '../interfaces/articleInterface';
import {supabase} from '../lib/initSupabase';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export default ({route}: {params: {session: object; id: number}} | any) => {
  const {id} = route.params;
  const [article, setArticle] = React.useState<IArticleData>(
    {} as IArticleData,
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  useEffect(() => {
    // a supp
    // @ts-ignore
    articleService.getArticleById(id).then((result: IArticleData) => {
      setArticle(result as IArticleData);
      setLoading(true);
    });
  }, [id]);

  console.log('article', article);

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <>
          <View style={styles.Figure} />
          <Pressable style={styles.Header} onPress={() => navigation.goBack()}>
            <Text style={styles.Icon}> ← </Text>
            <Text style={styles.Title}>{article.title}</Text>
          </Pressable>
          <View style={styles.Top}>
            {article.articles_images.map(item => (
              <React.Fragment key={item.id}>
                <Image
                  source={{
                    uri: supabase.storage
                      .from('swapold')
                      .getPublicUrl(item.image_name).data.publicUrl,
                  }}
                  style={styles.Image}
                />
              </React.Fragment>
            ))}
            <View style={styles.RightImage}>
              <Text style={styles.ImageMinify} />
              <Text style={styles.ImageMinify} />
              <Text style={styles.ImageMinify} />
              <Text style={styles.ImageMinify} />
            </View>
          </View>
          <View style={styles.Bottom}>
            <View>
              <Text style={styles.TextTitle}>Localisation</Text>
              <Text style={styles.TextSubtitle}>Lille, 3km</Text>
            </View>
            <View>
              <Text style={styles.TextTitle}>Description</Text>
              <Text style={styles.TextSubtitle}>{article.description}</Text>
            </View>
            <View>
              <Text style={styles.TextTitle}>Posté par</Text>
              <Text style={styles.TextSubtitle}>
                {article?.articles_profiles[0].profiles.username} le{' '}
                {' ' + new Date(article?.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <Pressable style={styles.Button}>
            <Text style={styles.ButtonText}>Proposer un échange</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  Figure: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 210,
    backgroundColor: '#CCCCCC',
    borderBottomRightRadius: 30,
  },

  Header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 20,
  },
  Title: {
    color: '#000',
    fontFamily: 'Roboto',
    fontSize: 28,
  },
  Icon: {
    color: '#000',
    fontSize: 28,
  },

  container: {
    flex: 1,
    marginBottom: 20,
  },

  Top: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  Image: {
    width: '80%',
    minHeight: 430,
    resizeMode: 'cover',
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
  },
  RightImage: {
    width: '20%',
    alignItems: 'center',
    marginTop: 150,
  },
  ImageMinify: {
    backgroundColor: 'grey',
    width: 50,
    height: 50,
    margin: 4,
    borderRadius: 10,
  },

  Bottom: {
    paddingLeft: 20,
    PaddingRight: 20,
  },
  TextTitle: {
    color: '#696969',
    fontFamily: 'Roboto',
    fontWeight: 'normal',
    fontSize: 16,
    paddingBottom: 8,
    paddingTop: 12,
  },
  TextSubtitle: {
    color: '#000000',
    fontSize: 14,
  },

  Button: {
    backgroundColor: '#D9D9D9',
    height: 60,
    marginTop: 50,
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ButtonText: {
    color: '#000',
    fontFamily: 'Roboto',
    fontSize: 16,
  },
});
