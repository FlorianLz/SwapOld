import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import articleService from '../services/article.service';
import SingleArticleCard from '../components/articles/SingleArticleCard';
import IArticleData from '../interfaces/articleInterface';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
export default function Favoris({session}: {session: any}) {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [articles, setArticles] = useState<IArticleData[] | []>([]);
  useEffect(() => {
    // Refresh the screen when the user comes back to it
    articleService
      .getFavoriteArticles(session.user.id)
      .then((result: IArticleData[]) => {
        setArticles(result as IArticleData[]);
      });
    /*supabase
      .channel('value-db-changes-' + session.user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'articles_favorites',
          filter: 'id_profile=eq.' + session.user.id,
        },
        payload => console.log(payload),
      )
      .subscribe();*/
  }, [isFocused, session.user.id]);
  return (
    <ScrollView>
      <View style={styles.ModeAffichageContainer}>
        <View style={styles.ModeAffichage}>
          {articles.map(article => (
            <SingleArticleCard
              key={article.id}
              modeAffichage={'mode2'}
              article={article}
              navigation={navigation}
              session={session}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ModeAffichage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingLeft: 20,
    marginBottom: 10,
    width: '100%',
  },
  ModeAffichageContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
});
