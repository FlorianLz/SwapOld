import {
  Text,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import IArticleData from '../../interfaces/articleInterface';
import SingleArticleCard from './SingleArticleCard';
import locationHelper from '../../helpers/location.helper';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconIon from 'react-native-vector-icons/Ionicons';

export default function ListArticles({
  session,
  articles,
  searchTermText,
}: {
  session: any;
  articles: IArticleData[];
  searchTermText: string;
}) {
  const [articlesTab, setArticlesTab] = useState<IArticleData[] | []>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [modeAffichage, setModeAffichage] = useState<string>('mode1');
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Utilise l'effet d'effet pour initialiser l'état des articles et la position par défaut de l'utilisateur.
   * @param articles Un tableau d'objets d'articles.
   */
  useEffect(() => {
    setArticlesTab(articles as IArticleData[]);
    // Récupère la position par défaut de l'utilisateur.
    locationHelper.setUserDefaultLocation().then(() => {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    });
  }, [articles]);

  /**
   * affiche une liste d'articles en mode grille ou en mode liste.
   */

  return (
    <View style={styles.fullContainer}>
      {articlesTab.length > 0 ? (
        <View style={styles.ModeAffichage}>
          <Text style={styles.Title}>Les derniers ajouts</Text>
          <View style={styles.ModeAffichageContainer}>
            <Pressable onPress={() => setModeAffichage('mode1')}>
              <IconIon
                name="ios-grid"
                size={20}
                color={modeAffichage === 'mode1' ? '#000' : '#D4D4D4'}
              />
            </Pressable>
            <Pressable onPress={() => setModeAffichage('mode2')}>
              <Icon
                name="list-ul"
                size={20}
                color={modeAffichage === 'mode2' ? '#000' : '#D4D4D4'}
              />
            </Pressable>
          </View>
        </View>
      ) : null}
      <ScrollView contentContainerStyle={{flex: 1}}>
        <View style={styles.ListArticle}>
          {articlesTab.length > 0 ? (
            articlesTab.map(article => (
              <SingleArticleCard
                key={article.id}
                modeAffichage={modeAffichage}
                article={article}
                navigation={navigation}
                session={session}
              />
            ))
          ) : searchTermText !== '' ? (
            <View style={styles.notFound}>
              <Image
                source={require('../../assets/img/voidSearch.png')}
                style={styles.notFoundImage}
              />
              <Text style={styles.notFoundTitle}>
                Aucun article trouvé pour votre recherche : {searchTermText}
              </Text>
            </View>
          ) : (
            <View style={styles.notFound}>
              {loading ? (
                <ActivityIndicator size="large" color="#5DB075" />
              ) : (
                <>
                  <Image
                    source={require('../../assets/img/voidArticles.png')}
                    style={styles.notFoundImage}
                  />
                  <Text style={styles.notFoundTitle}>
                    Aucun article n'est disponible
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * STYLES
 */

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
    alignItems: 'center',
    gap: 10,
  },
  Title: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  ListArticle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 230,
    height: '100%',
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  notFoundImage: {
    width: 200,
    height: 200,
  },
  notFoundTitle: {
    fontSize: 16,
    paddingTop: 20,
    color: '#000',
  },
  fullContainer: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
});
