import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import IArticleData from '../interfaces/articleInterface';
import articleService from '../services/article.service';
import SingleArticleCard from '../components/articles/SingleArticleCard';
import IconAnt from "react-native-vector-icons/AntDesign";
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
      .getAllMyPublishedArticlesNotProposedForSpecificId(
        article_sender.article.id,
        session.user.id,
      )
      .then((result: any) => {
        console.log('result');
        console.log(result);
        console.log(Object.prototype.toString.call(result));
        if (result?.length === 0 || result === undefined) {
          let article = article_sender;
          navigation.navigate('AddArticle', {
            privateArticle: true,
            article_sender: {article_sender},
          });
        }
        setArticlesPublished(result as IArticleData[]);
      });
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <Pressable style={styles.Header} onPress={() => navigation.goBack()}>
        <IconAnt style={styles.Icon} name="arrowleft" size={24} color="#000" />
        <View style={styles.containerHeaderInfos}>
          <Text style={styles.BackText}>Veuillez sélectionner un article pour finaliser la proposition</Text>
        </View>
      </Pressable>
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
  Header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 20,
  },
  Title: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 28,
  },
  Icon: {
    marginRight: 20,
  },

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
