import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import articleRepository from '../repository/article.repository';

export default function SwapProposition({session}: {session: any}) {
  const [swaps, setSwaps] = React.useState([]);
  useEffect(() => {
    articleRepository
      .getSwapsByStateAndProfile(session.user.id, 2)
      .then(res => {
        //console.log(res.data[0]);
        setSwaps(res.data);
      });
  }, []);
  return (
    <View>
      <Text>Recap des proposition</Text>
      {swaps &&
        swaps.map((swap: any) => {
          return (
            <View key={swap.id}>
              {swap.id_profile_receiver === session.user.id ? (
                <Text>
                  Vous avez reçu une demande de{' '}
                  {
                    swap.id_article_receiver.articles_profiles[0].profiles
                      .username
                  }
                </Text>
              ) : (
                <Text>
                  Vous avez envoyé une demande à{' '}
                  {
                    swap.id_article_receiver.articles_profiles[0].profiles
                      .username
                  }
                </Text>
              )}
              <Text>
                {swap.id} -- {swap.id_article_receiver.title} -{' '}
                {swap.id_article_sender.title} : {swap.state}
              </Text>
            </View>
          );
        })}
    </View>
  );
}
