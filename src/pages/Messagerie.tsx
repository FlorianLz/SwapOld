import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {Text} from 'react-native-elements';
import SingleArticleCard from '../components/articles/SingleArticleCard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import articleService from '../services/article.service';
export default function Messagerie({session}: {session: any}) {
  const isFocused = useIsFocused();
  const [swaps, setSwaps] = React.useState<object[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  useEffect(() => {
    articleService.getSwapsByStateAndProfile(2, session.user.id).then(res => {
      //console.log('res', res);
      setSwaps(res);
    });
  }, [isFocused, session.user.id]);
  return (
    <ScrollView style={styles.container}>
      <Text h3 style={styles.title}>
        Messagerie
      </Text>
      {swaps &&
        swaps.map((swap: any) => {
          return (
            <Text key={swap.id}>
              <SingleArticleCard
                navigation={navigation}
                article={swap}
                modeAffichage={'mode2'}
                session={session}
                url={'Messagerie'}
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
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});
