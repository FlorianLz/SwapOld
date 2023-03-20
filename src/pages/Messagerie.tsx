import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {Text} from 'react-native-elements';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import articleService from '../services/article.service';
import IArticleData from '../interfaces/articleInterface';
import ListMessagerie from './ListMessagerie';

export default function Messagerie({session}: {session: any}) {
  const isFocused = useIsFocused();
  const [swaps, setSwaps] = React.useState<object[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  useEffect(() => {
    articleService
      .getSwapsByStateAndProfile(2, session.user.id)
      .then((result: IArticleData[]) => {
        setSwaps(result as IArticleData[]);
      });
  }, [isFocused, session.user.id]);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Messagerie récents</Text>
      {swaps &&
        swaps.map((swap: any) => {
          return (
            <Text key={swap.id}>
              <ListMessagerie
                navigation={navigation}
                article={swap}
                session={session}
              />
            </Text>
          );
        })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
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
});
