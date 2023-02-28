import {Text, View, Pressable, ScrollView, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import articleService from '../../services/article.service';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import IArticleData from '../../interfaces/articleInterface';
import SingleArticleCard from './SingleArticleCard';
import locationHelper from '../../helpers/location.helper';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconIon from 'react-native-vector-icons/Ionicons';

export default function ListArticles({session}: {session: any}) {
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
      <View style={styles.ListArticle}>
        {articles.map(article => (
          <SingleArticleCard
            key={article.id}
            modeAffichage={modeAffichage}
            article={article}
            navigation={navigation}
            session={session}
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
    marginBottom: 10,
  },
});
