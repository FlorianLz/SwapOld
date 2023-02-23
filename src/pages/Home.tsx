import { SafeAreaView, Text, View } from "react-native";
import React, {useEffect, useState} from 'react';
import {supabase} from '../lib/initSupabase';
import Menu from '../components/Menu';
type ArticleData = {
  id: number;
  title: string;
  created_at: Date;
};
export default function Home() {
  const [articles, setArticles] = useState<ArticleData[] | []>([]);
  async function fetchArticles() {
    const {data} = await supabase.from('articles').select('*');
    return data;
  }
  useEffect(() => {
    fetchArticles().then(resul => {
      setArticles(resul as ArticleData[]);
    });
  }, []);

  return (
    <View>
      <Text>Home</Text>
      {articles.map((article, index) => (
        <Text key={index}>{article.title}</Text>
      ))}
    </View>
  );
}
