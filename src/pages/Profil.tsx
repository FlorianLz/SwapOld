import {Button, ScrollView, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import articleService from '../services/article.service';
import IArticleData from '../interfaces/articleInterface';
import SingleArticleCard from '../components/articles/SingleArticleCard';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import RecapProposition from '../components/RecapProposition';

export default function Profil({session}: {session: any}) {
  const [selectedComponent, setSelectedComponent] = useState('articles');
  const [articles, setArticles] = useState<IArticleData[]>([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    setSelectedComponent('articles');
    articleService.getAllMyPublishedArticles(session.user.id).then(result => {
      setArticles(result);
    });
  }, [isFocused]);
  return (
    <ScrollView>
      <Text>Profil</Text>
      <View>
        <Button
          title={'Articles publiés'}
          onPress={() => setSelectedComponent('articles')}
        />
        <Button
          title={'Propositions'}
          onPress={() => setSelectedComponent('propositions')}
        />
        {selectedComponent === 'articles' &&
          articles.map(article => (
            <React.Fragment key={article.id}>
              <SingleArticleCard
                navigation={navigation}
                article={article}
                modeAffichage={'mode2'}
                session={session}
              />
            </React.Fragment>
          ))}
        {selectedComponent === 'propositions' && (
          <RecapProposition session={session} navigation={navigation} />
        )}
      </View>
    </ScrollView>
  );
}
