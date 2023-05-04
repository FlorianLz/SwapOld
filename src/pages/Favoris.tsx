import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import articleService from '../services/article.service';
import SingleArticleCard from '../components/articles/SingleArticleCard';
import IArticleData from '../interfaces/articleInterface';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Text} from 'react-native-elements';
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
    <SafeAreaView>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerScrollView}>
        <Text h4 style={styles.title}>
          Favoris
        </Text>
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
        {articles.length === 0 && (
          <View
            style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
            <Image
              source={require('../assets/img/voidFavorites.png')}
              style={{width: 200, height: 200}}
            />
            <Text style={styles.notFoundTitle}>
              Aucun favoris pour le moment...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  ModeAffichage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
    gap: 20,
  },
  ModeAffichageContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  notFoundTitle: {
    fontSize: 16,
    paddingTop: 20,
    color: '#000',
    textAlign: 'center',
  },
});
