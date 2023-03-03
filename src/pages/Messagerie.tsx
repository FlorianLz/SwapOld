import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import articleRepository from '../repository/article.repository';
export default function Messagerie({session}: {session: any}) {
  const isFocused = useIsFocused();
  const [swaps, setSwaps] = React.useState([]);
  useEffect(() => {
    articleRepository
      .getSwapsByStateAndProfile(session.user.id, 2)
      .then(res => {
        console.log(res.data[0]);
        setSwaps(res.data);
      });
  }, [isFocused]);
  return (
    <View>
      <Text>Messagerie</Text>
    </View>
  );
}
