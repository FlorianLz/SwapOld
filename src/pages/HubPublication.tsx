import React, {useEffect, useState} from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import IArticleData from '../interfaces/articleInterface';
import articleService from '../services/article.service';
import SingleArticleCard from '../components/articles/SingleArticleCard';
export default function HubPublication({session}: {session: any}) {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
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
    <ScrollView>
      <Button
        title={'Ajouter un article'}
        onPress={() => navigation.navigate('AddArticle')}
      />
      <Text>Articles publiés</Text>
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
                />
              ))
            : null}
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
