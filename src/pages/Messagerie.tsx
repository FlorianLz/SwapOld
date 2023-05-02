import React, {useEffect} from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {Text} from 'react-native-elements';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import articleService from '../services/article.service';
import IArticleData from '../interfaces/articleInterface';
import ListMessagerie from './ListMessagerie';
import articleRepository from '../repository/article.repository';

export default function Messagerie({session}: {session: any}) {
  const isFocused = useIsFocused();
  const [swaps, setSwaps] = React.useState<object[]>([]);
  const [notReadArticles, setNotReadArticles] = React.useState<number[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  useEffect(() => {
    articleService
      .getSwapsByStateAndProfileForMessages(2, session.user.id)
      .then((result: IArticleData[]) => {
        articleService.getDateLastMessageByIdArticle().then((results: any) => {
          let articles = [...result];
          articles.sort((a, b) => {
            const aIndex = results.indexOf(a.id);
            const bIndex = results.indexOf(b.id);
            return aIndex - bIndex;
          });
          setSwaps(articles as IArticleData[]);
        });
      });
    articleRepository
      .getArticlesIdWhereMessageNotRead(session.user.id)
      .then((result: any) => {
        let resultsId = [
          ...new Set(result.data.map((item: any) => item.id_article)),
        ];
        console.log('resultsId', resultsId)
        setNotReadArticles(resultsId as number[]);
      });
  }, [isFocused, session.user.id]);
  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerScrollView}>
        <Text h4 style={styles.title}>
          Messagerie
        </Text>
        {swaps &&
          swaps.map((swap: any) => {
            return (
              <Text key={swap.id}>
                <ListMessagerie
                  navigation={navigation}
                  article={swap}
                  session={session}
                  notRead={notReadArticles.includes(swap.id)}
                />
              </Text>
            );
          })}
        {swaps.length === 0 && (
          <View
            style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
            <Image
              source={require('../assets/img/voidMessages.png')}
              style={{width: 200, height: 200}}
            />
            <Text style={styles.notFoundTitle}>
              Aucun message pour le moment...
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
const styles = StyleSheet.create({
  containerScrollView: {
    height: '100%',
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
  notFoundTitle: {
    fontSize: 16,
    paddingTop: 20,
    color: '#000',
    textAlign: 'center',
  },
});
