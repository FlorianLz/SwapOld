import React from 'react';
import {SafeAreaView} from 'react-native';
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

  /**
   * Utilisation de useEffect pour charger tous les articles au montage du composant et mettre à jour la liste des articles lorsqu'il est redirigé
   */
  useEffect(() => {
    // Appel à la fonction getAllArticles du service des articles pour obtenir tous les articles
    // associés à l'utilisateur connecté (s'il est connecté)
    articleService
      .getAllArticles(session?.user.id)
      .then((result: IArticleData[]) => {
        // Mettre à jour la liste des articles avec les données renvoyées par la fonction getAllArticles
        setArticles(result as IArticleData[]);
        // Mettre à jour la liste de tous les articles (pour une utilisation ultérieure)
        setAllArticles(result as IArticleData[]);
      });
  }, [isFocused]);

  /**
   * Cette fonction est asynchrone et est appelée lorsqu'un utilisateur soumet une recherche.
   * @param searchTerm La chaîne de caractères à rechercher.
   */
  async function handleSearchSubmit(searchTerm: string) {
    // Met à jour l'état de la chaîne de recherche.
    setSearchTermText(searchTerm);

    // Vérifie si la chaîne de recherche est vide.
    if (searchTerm.trim() === '') {
      // Si la chaîne de recherche est vide, supprime le texte de recherche et affiche tous les articles.
      setSearchTermText('');
      setArticles(allArticles);
    }

    // Recherche les articles correspondants à la chaîne de recherche et à l'ID de l'utilisateur actuel.
    articleService
      .searchArticles(searchTerm, session?.user.id)
      .then((result: IArticleData[]) => {
        // Met à jour l'état des articles avec les résultats de la recherche.
        setArticles(result as IArticleData[]);
      });
  }

  /**
   * Afficher les articles + barre de recherche
   */
  return (
    <SafeAreaView>
      <SearchBar onSubmit={handleSearchSubmit} />
      {isFocused ? (
        <ListArticles
          session={session}
          articles={articles}
          searchTermText={searchTermText}
        />
      ) : null}
    </SafeAreaView>
  );
}
