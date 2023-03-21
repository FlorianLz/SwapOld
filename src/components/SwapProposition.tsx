import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import IArticleData from '../interfaces/articleInterface';
import articleService from '../services/article.service';
import SingleArticleCard from '../components/articles/SingleArticleCard';
export default function SwapProposition({
  route,
}: {params: {session: object; id: number; article_sender: any}} | any) {
  const {session} = route.params;
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {article_sender} = route.params;
  const [articlesPublished, setArticlesPublished] = useState<
    IArticleData[] | []
  >([]);

  useEffect(() => {
    articleService
      .getAllMyPublishedArticles(session.user.id)
      .then((result: IArticleData[]) => {
        setArticlesPublished(result as IArticleData[]);
      });
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Veuillez selectionner un article pour finaliser la proposition
      </Text>
      <View style={styles.ModeAffichageContainer}>
        <View style={styles.ModeAffichage}>
          {isFocused
            ? articlesPublished.map(article => (
                <SingleArticleCard
                  key={article.id}
                  modeAffichage={'mode2'}
                  article={article}
                  navigation={navigation}
                  session={session}
                  hideLike={true}
                  url={'SwapProposition'}
                  article_sender={article_sender}
                />
              ))
            : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    marginRight: 20,
  },
  title: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 20,
  },
  ModeAffichage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  ModeAffichageContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
});
