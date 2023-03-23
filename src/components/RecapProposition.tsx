import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Button,
  Pressable,
  Animated,
} from 'react-native';
import articleRepository from '../repository/article.repository';
import {supabase} from '../lib/initSupabase';
import Icon from 'react-native-vector-icons/EvilIcons';
import IconIco from 'react-native-vector-icons/Ionicons';

export default function RecapProposition({session, navigation}: any) {
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
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    articleRepository
      .getSwapsByStateAndProfile(session.user.id, 0)
      .then(res => {
        setSwaps(res.data);
      });
  }, []);
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'column'}}>
        <Pressable onPress={() => setActiveIndex(activeIndex === 0 ? -1 : 0)}>
          <View style={styles.header}>
            <Text style={styles.header_text}>Reçues</Text>
            <Icon
              name="chevron-right"
              size={30}
              color="#000"
              style={
                activeIndex === 0 ? styles.iconActive : styles.iconInactive
              }
            />
          </View>
        </Pressable>
        <ScrollView style={{display: activeIndex === 0 ? 'flex' : 'none'}}>
          {swaps &&
            swaps.map((swap: any) => {
              return (
                <View key={swap.id}>
                  {swap.id_profile_receiver === session.user.id ? (
                    <View>
                      <View style={styles.swapContainer}>
                        <Text style={styles.swapLeft}>
                          <Text style={styles.swap_title}>
                            {swap.id_article_receiver.title}
                          </Text>
                        </Text>
                        <IconIco
                          name="swap-horizontal"
                          size={30}
                          color="#000"
                          style={styles.iconSwap}
                        />
                        <View style={styles.swapRight}>
                          <Text style={styles.swap_title}>
                            {swap.id_article_sender.title}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.buttonContainer}>
                        <Button
                          title={'Accepter'}
                          onPress={() => {
                            articleRepository
                              .changeStateSwapArticle(
                                swap.id,
                                session.user.id,
                                2,
                              )
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
                              .changeStateSwapArticle(
                                swap.id,
                                session.user.id,
                                1,
                              )
                              .then(res => {
                                console.log(res);
                              });
                          }}
                        />
                      </View>
                    </View>
                  ) : (
                    <Text>Vous n'avez pas de demande</Text>
                  )}
                </View>
              );
            })}
        </ScrollView>

        <Pressable onPress={() => setActiveIndex(activeIndex === 1 ? -1 : 1)}>
          <View style={styles.header}>
            <Text style={styles.header_text}>Envoyées</Text>
            <Icon
              name="chevron-right"
              size={30}
              color="#000"
              style={
                activeIndex === 1 ? styles.iconActive : styles.iconInactive
              }
            />
          </View>
        </Pressable>
        <ScrollView style={{display: activeIndex === 1 ? 'flex' : 'none'}}>
          {swaps &&
            swaps.map((swap: any) => {
              return (
                <View key={swap.id}>
                  {swap.id_profile_receiver !== session.user.id ? (
                    <View style={styles.swapContainer}>
                      <View style={styles.swapLeft}>
                        <Text style={styles.swap_title}>
                          {swap.id_article_sender.title}
                        </Text>
                      </View>
                      <IconIco
                        name="swap-horizontal"
                        size={30}
                        color="#000"
                        style={styles.iconSwap}
                      />
                      <Text style={styles.swapRight}>
                        <Text style={styles.swap_title}>
                          {swap.id_article_receiver.title}
                        </Text>
                      </Text>
                    </View>
                  ) : (
                    <Text>Vous n'avez pas envoyée de demande</Text>
                  )}
                </View>
              );
            })}
        </ScrollView>

        <Pressable onPress={() => setActiveIndex(activeIndex === 2 ? -1 : 2)}>
          <View style={styles.header}>
            <Text style={styles.header_text}>Acceptées</Text>
            <Icon
              name="chevron-right"
              size={30}
              color="#000"
              style={
                activeIndex === 2 ? styles.iconActive : styles.iconInactive
              }
            />
          </View>
        </Pressable>
        <ScrollView style={{display: activeIndex === 2 ? 'flex' : 'none'}}>
          <Text>Contenu de la deuxième vue</Text>
        </ScrollView>

        <Pressable onPress={() => setActiveIndex(activeIndex === 3 ? -1 : 3)}>
          <View style={styles.header}>
            <Text style={styles.header_text}>Refusées</Text>
            <Icon
              name="chevron-right"
              size={30}
              color="#000"
              style={
                activeIndex === 3 ? styles.iconActive : styles.iconInactive
              }
            />
          </View>
        </Pressable>
        <ScrollView style={{display: activeIndex === 3 ? 'flex' : 'none'}}>
          <Text>Contenu de la troisième vue</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  swapContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 4,
    borderBottomWidth: 2,
  },
  swapLeft: {
    width: '30%',
  },
  iconSwap: {
    width: '30%',
    textAlign: 'center',
  },
  swapRight: {
    width: '30%',
    textAlign: 'right',
  },
  swap_title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  container: {
    paddingBottom: 50,
  },
  iconActive: {
    transform: [{rotate: '90deg'}],
  },
  iconInactive: {
    transform: [{rotate: '0deg'}],
  },
  swapText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  header_text: {
    fontSize: 14,
    color: '#000',
    width: '94%',
  },
});
