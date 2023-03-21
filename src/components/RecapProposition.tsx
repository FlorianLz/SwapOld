import React, {useEffect} from 'react';
import {Text, View, StyleSheet, ScrollView, Button} from 'react-native';
import articleRepository from '../repository/article.repository';
import {supabase} from '../lib/initSupabase';

export default function RecapProposition({
  session,
  navigation,
}: any) {

  async function updateSwapsState() {
    try {
      const {data, error} = await supabase.rpc('update_swaps_state');

      if (error) {
        console.error(error);
        return;
      }

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  const [swaps, setSwaps] = React.useState<any[]>([]);
  useEffect(() => {
    articleRepository
      .getSwapsByStateAndProfile(session.user.id, 0)
      .then(res => {
        setSwaps(res.data);
      });
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recap des proposition</Text>
      <ScrollView style={styles.scrollView}>
        {swaps &&
          swaps.map((swap: any) => {
            return (
              <View key={swap.id} style={styles.swapContainer}>
                {swap.id_profile_receiver === session.user.id ? (
                  <View>
                    <Text style={styles.swapText}>
                      Vous avez reçu une demande de{' '}
                      {
                        swap.id_article_receiver.articles_profiles[0].profiles
                          .username
                      }
                    </Text>
                    <View style={styles.buttonContainer}>
                      <Button
                        title={'Accepter'}
                        onPress={() => {
                          articleRepository
                            .changeStateSwapArticle(swap.id, session.user.id, 2)
                            .then(res => {
                              if (res.data) {
                                articleRepository
                                  .changeStateArticle(
                                    res.data[0].id_article_sender,
                                    res.data[0].id_article_receiver,
                                    1,
                                  )
                                  .then(res => {
                                    if (res) {
                                      updateSwapsState();
                                      navigation.navigate('HubPublication');
                                    }
                                  });
                              }
                            });
                        }}
                      />
                      <Button
                        title={'Refuser'}
                        onPress={() => {
                          console.log('refuser');
                          articleRepository
                            .changeStateSwapArticle(swap.id, session.user.id, 1)
                            .then(res => {
                              console.log(res);
                            });
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.swapText}>
                    Vous avez envoyé une demande à{' '}
                    {
                      swap.id_article_receiver.articles_profiles[0].profiles
                        .username
                    }
                  </Text>
                )}
                <Text style={styles.swapText}>
                  {swap.id} -- {swap.id_article_receiver.title} -{' '}
                  {swap.id_article_sender.title} : {swap.state}
                </Text>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  swapContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  swapText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  refuseButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
});
