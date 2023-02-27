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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingLeft: 20,
    marginBottom: 10,
  },
  ModeAffichageContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
});
