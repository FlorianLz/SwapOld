import React from 'react';
import {View} from 'react-native';
import ListArticles from '../components/articles/ListArticles';
import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import articleService from '../services/article.service';
import IArticleData from '../interfaces/articleInterface';
import SearchBar from '../components/SearchBar';
export default function Home({session}: {session: any}) {
  const [articles, setArticles] = useState<IArticleData[] | []>([]);
  const [allArticles, setAllArticles] = useState<IArticleData[] | []>([]);
  const [searchTermText, setSearchTermText] = useState<string>('');
  const isFocused = useIsFocused();
  useEffect(() => {
    // Refresh the screen when the user comes back to it
    articleService
      .getAllArticles(session?.user.id)
      .then((result: IArticleData[]) => {
        setArticles(result as IArticleData[]);
        setAllArticles(result as IArticleData[]);
      });
  }, [isFocused]);

  async function handleSearchSubmit(searchTerm: string) {
    setSearchTermText(searchTerm);
    if (searchTerm.trim() === '') {
      setSearchTermText('');
      setArticles(allArticles);
    }
    articleService
      .searchArticles(searchTerm, session?.user.id)
      .then((result: IArticleData[]) => {
        setArticles(result as IArticleData[]);
      });
  }

  return (
    <View>
      <SearchBar onSubmit={handleSearchSubmit} />
      {isFocused ? (
        <ListArticles
          session={session}
          articles={articles}
          searchTermText={searchTermText}
        />
      ) : null}
    </View>
  );
}
