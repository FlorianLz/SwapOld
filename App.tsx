/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {supabase} from './src/lib/initSupabase';
import Account from './src/components/Account';
import Auth from './src/components/Login';
import {Session} from '@supabase/supabase-js';

type ArticleData = {
  id: number;
  title: string;
  created_at: Date;
};
const App = () => {
  const [articles, setArticles] = useState<ArticleData[] | []>([]);
  const [session, setSession] = useState<Session | null>(null);

  async function fetchArticles() {
    const {data} = await supabase.from('articles').select('*');
    return data;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    fetchArticles().then(resul => {
      setArticles(resul as ArticleData[]);
    });
  }, []);

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          {articles.map((article, index) => (
            <Text key={index}>{article.title}</Text>
          ))}
          {session && session.user ? (
            <Account key={session.user.id} session={session} />
          ) : (
            <Auth />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
