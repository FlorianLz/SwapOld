import {Text, View, Pressable, ScrollView, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import articleService from '../../services/article.service';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import IArticleData from '../../interfaces/articleInterface';
import SingleArticleCard from './SingleArticleCard';
import locationHelper from '../../helpers/location.helper';
import Geolocation from '@react-native-community/geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
export default function ListArticles() {
  const [articles, setArticles] = useState<IArticleData[] | []>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [modeAffichage, setModeAffichage] = useState<string>('mode1');

  useEffect(() => {
    articleService.getAllArticles().then((result: IArticleData[]) => {
      setArticles(result as IArticleData[]);
    });

    locationHelper.setUserDefaultLocation();
  }, []);

  return (
    <ScrollView>
      <View style={styles.ModeAffichage}>
        <Text style={styles.Title}>Les derniers ajouts</Text>
        <View style={styles.ModeAffichageContainer}>
          <Pressable onPress={() => setModeAffichage('mode1')}>
            <Text style={styles.Mode1}>1</Text>
          </Pressable>
          <Pressable onPress={() => setModeAffichage('mode2')}>
            <Text style={styles.Mode1}>2</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.ListArticle}>
        {articles.map(article => (
          <SingleArticleCard
            key={article.id}
            modeAffichage={modeAffichage}
            article={article}
            navigation={navigation}
          />
        ))}
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
  Title: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  Mode1: {
    color: '#000',
    width: 20,
    height: 20,
  },
  Mode2: {
    color: '#000',
    width: 20,
    height: 20,
  },
  ListArticle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    paddingRight: 20,
    paddingLeft: 20,
    marginBottom: 10,
  },
});
