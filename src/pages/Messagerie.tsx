import React, {useEffect} from 'react';
import {Image, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
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
    // Effectue une requête à l'API pour récupérer les swaps (échanges) dans un certain état pour un utilisateur donné
    // Le paramètre 2 correspond à l'état des swaps à récupérer
    // session.user.id correspond à l'identifiant de l'utilisateur en cours de session
    articleService
      .getSwapsByStateAndProfileForMessages(2, session.user.id)
      .then((result: IArticleData[]) => {
        // Récupère la date du dernier message pour chaque swap
        articleService.getDateLastMessageByIdArticle().then((results: any) => {
          // Copie les swaps récupérés dans un tableau
          let articles = [...result];
          // Trie les swaps selon la date de leur dernier message, en utilisant les résultats précédemment récupérés
          articles.sort((a, b) => {
            const aIndex = results.indexOf(a.id);
            const bIndex = results.indexOf(b.id);
            return aIndex - bIndex;
          });
          // Met à jour l'état des swaps
          setSwaps(articles as IArticleData[]);
        });
      });
    // Effectue une requête à l'API pour récupérer les identifiants des articles contenant des messages non lus pour un utilisateur donné
    // session.user.id correspond à l'identifiant de l'utilisateur en cours de session
    articleRepository
      .getArticlesIdWhereMessageNotRead(session.user.id)
      .then((result: any) => {
        // Retire les doublons de la liste d'identifiants
        let resultsId = [
          ...new Set(result.data.map((item: any) => item.id_article)),
        ];
        // Met à jour l'état des articles non lus
        setNotReadArticles(resultsId as number[]);
      });
  }, [isFocused, session.user.id]);

  /**
   * affiche la liste des conversations disponibles
   */
  return (
    <SafeAreaView>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerScrollView}>
        <Text h4 style={styles.title}>
          Messagerie
        </Text>
        {swaps &&
          swaps.map((swap: any) => {
            return (
              <Text key={swap.id} style={styles.containerMessages}>
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
    </SafeAreaView>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  containerScrollView: {
    height: '100%',
  },
  container: {
    marginLeft: 20,
    marginRight: 20,
  },
  containerMessages: {
    marginBottom: 10,
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
