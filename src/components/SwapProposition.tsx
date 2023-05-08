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
import IconAnt from 'react-native-vector-icons/AntDesign';
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

  /**
   * Utilise useEffect pour exécuter une fonction asynchrone qui récupère une liste des articles publiés par l'utilisateur actuel,
   * mais qui ne sont pas encore proposés pour un échange avec un article spécifique. Si cette liste est vide ou indéfinie,
   * navigue vers la page "Ajouter un article" avec l'indicateur "privateArticle" à true.
   * Met à jour la liste d'articles publiés avec les résultats de la requête.
   *
   * @param {boolean} isFocused - Indique si l'écran actuel a le focus ou non.
   */
  useEffect(() => {
    articleService
      .getAllMyPublishedArticlesNotProposedForSpecificId(
        article_sender.article.id,
        session.user.id,
      )
      .then((result: any) => {
        if (result?.length === 0 || result === undefined) {
          navigation.navigate('AddArticle', {
            privateArticle: true,
            article_sender: {article_sender},
          });
        }
        setArticlesPublished(result as IArticleData[]);
      });
  }, [isFocused]);

  /**
   * Affiche la liste des articles publiés par l'utilisateur connecté pour qu'il puisse en sélectionner un et le proposer à l'utilisateur qui a publié son article
   */

  return (
    <View style={styles.container}>
      <Pressable style={styles.Header} onPress={() => navigation.goBack()}>
        <IconAnt style={styles.Icon} name="arrowleft" size={24} color="#000" />
        <View style={styles.containerHeaderInfos}>
          <Text style={styles.BackText}>
            Veuillez sélectionner un article pour finaliser la proposition
          </Text>
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

/**
 * Styles
 */

const styles = StyleSheet.create({
  Header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 20,
  },
  containerHeaderInfos: {
    flexDirection: 'column',
  },
  BackSecond: {
    color: '#000',
    fontFamily: 'System',
    fontSize: 12,
  },
  BackText: {
    color: '#000',
    fontFamily: 'System',
    fontSize: 16,
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
