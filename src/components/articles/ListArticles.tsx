import { Image, StyleSheet, Text, View, Pressable, Button } from "react-native";
import React, {useEffect, useState} from 'react';
import articleService from '../../services/article.service';
import {supabase} from '../../lib/initSupabase';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {IArticleData} from '../../interfaces/articleInterface';
import SingleArticleCard from "./SingleArticleCard";
export default function ListArticles() {
  const [articles, setArticles] = useState<IArticleData[] | []>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [modeAffichage, setModeAffichage] = useState<string>('mode1');

  useEffect(() => {
    // a supp
    // @ts-ignore
    articleService.getAllArticles().then((resul: IArticleData[]) => {
      setArticles(resul as IArticleData[]);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Text>Les derniers ajouts</Text>
        <View>
          <Button title={'Mode 1'} onPress={() => setModeAffichage('mode1')} />
          <Button title={'Mode 2'} onPress={() => setModeAffichage('mode2')} />
        </View>
      </View>
      <View>
        {articles.map(article => (
          <SingleArticleCard modeAffichage={modeAffichage} article={article} navigation={navigation} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
});
