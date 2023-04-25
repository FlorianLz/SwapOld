import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import articleRepository from '../repository/article.repository';
import {supabase} from '../lib/initSupabase';
import Icon from 'react-native-vector-icons/EvilIcons';
import IconIco from 'react-native-vector-icons/Ionicons';
import locationHelper from '../helpers/location.helper';
import {useIsFocused} from '@react-navigation/native';
import imagesHelper from '../helpers/images.helper';

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
  const [swapsAccepted, setSwapsAccepted] = React.useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [location, setLocation] = useState({});
  const [modalChoiceVisible, setModalChoiceVisible] = useState(false);
  const [idSwapModale, setIdSwapModale] = useState(0);
  const [idArticleModale, setIdArticleModale] = useState(0);
  const [nomArticleModale1, setNomArticleModale1] = useState('');
  const [nomArticleModale2, setNomArticleModale2] = useState('');
  const [nbPropositionsRecues, setNbPropositionsRecues] = useState(0);
  const [nbPropositionsEnvoyees, setNbPropositionsEnvoyees] = useState(0);
  const [nbPropositionsAcceptees, setNbPropositionsAcceptees] = useState(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    locationHelper.getUserLocation().then(location => {
      setLocation(location);
    });
    articleRepository
      .getSwapsByStateAndProfile(session.user.id, 0)
      .then(res => {
        setSwaps(res.data);
        console.log(res.data);
        let nbPropositionsRecuesTemp = 0;
        let nbPropositionsEnvoyeesTemp = 0;
        res.data?.forEach((swap: any) => {
          if (swap.id_profile_receiver === session.user.id) {
            nbPropositionsRecuesTemp++;
          }
          if (swap.id_profile_sender === session.user.id) {
            nbPropositionsEnvoyeesTemp++;
          }
        });
        setNbPropositionsRecues(nbPropositionsRecuesTemp);
        setNbPropositionsEnvoyees(nbPropositionsEnvoyeesTemp);

      });
    articleRepository
      .getSwapsByStateAndProfile(session.user.id, 2)
      .then(res => {
        setSwapsAccepted(res.data);
        console.log(res.data);
        let nbPropositionsAccepteesTemp = 0;
        res.data?.forEach((swap: any) => {
          if (swap.state === 2) {
            nbPropositionsAccepteesTemp++;
          }
        });
        setNbPropositionsAcceptees(nbPropositionsAccepteesTemp);
      });
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'column'}}>
        <Pressable onPress={() => setActiveIndex(activeIndex === 0 ? -1 : 0)}>
          <View style={styles.header}>
            <Text style={styles.header_text}>Reçues ({nbPropositionsRecues})</Text>
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
          {nbPropositionsRecues > 0 ? (
            swaps.map((swap: any) => {
              return (
                <Pressable
                  key={swap.id}
                  onPress={() => {
                    setIdSwapModale(swap.id);
                    setIdArticleModale(swap.id_article_receiver.id);
                    setModalChoiceVisible(true);
                    setNomArticleModale1(swap.id_article_receiver.title);
                    setNomArticleModale2(swap.id_article_sender.title);
                  }}>
                  <View>
                    {swap.id_profile_receiver === session.user.id ? (
                      <View>
                        <View style={styles.swapContainer}>
                          <View style={styles.swapLeft}>
                            <Image
                              style={styles.image}
                              source={{
                                uri: imagesHelper.getPublicUrlByImageName(
                                  swap.id_article_sender.articles_images[0]
                                    .image_name,
                                ),
                              }}
                            />
                            <View>
                              <Text
                                style={[styles.swap_title]}>
                                {swap.id_article_sender.title}
                              </Text>
                              <Text
                                style={[styles.Localisation]}>
                                {swap.id_article_sender.location.cityName},{' '}
                                {locationHelper.getDistanceFromLatLonInKm(
                                  swap.id_article_sender.location?.latitude,
                                  swap.id_article_sender.location?.longitude,
                                  location.coords?.latitude,
                                  location.coords?.longitude,
                                )}
                                km
                              </Text>
                            </View>
                          </View>
                          <IconIco
                            name="swap-horizontal"
                            size={30}
                            color="#000"
                            style={styles.iconSwap}
                          />
                          <View style={styles.swapRight}>
                            <View>
                              <Text style={[styles.swap_title, styles.TextRight]}>
                                {swap.id_article_receiver.title}
                              </Text>
                              <Text style={styles.Localisation}>
                                {swap.id_article_receiver.location.cityName},{' '}
                                {locationHelper.getDistanceFromLatLonInKm(
                                  swap.id_article_receiver.location.latitude,
                                  swap.id_article_receiver.location.longitude,
                                  location.coords.latitude,
                                  location.coords.longitude,
                                )}
                                km
                              </Text>
                            </View>
                            <Image
                              style={styles.image}
                              source={{
                                uri: imagesHelper.getPublicUrlByImageName(
                                  swap.id_article_receiver.articles_images[0]
                                    .image_name,
                                ),
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })
          ) : (
            <Text>Vous n'avez aucune proposition</Text>
          )}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalChoiceVisible}
            onRequestClose={() => {
              setModalChoiceVisible(!modalChoiceVisible);
            }}>
            <Pressable style={styles.centeredView} onPress={()=>(setModalChoiceVisible(!modalChoiceVisible))}>
              <Pressable style={styles.modalView} onPress={(event)=>event.stopPropagation()}>
                <Text style={styles.modalText}>
                  Voulez-vous accepter l'échange de "{nomArticleModale1}" contre
                  "{nomArticleModale2}" ?
                </Text>
                <Pressable
                  style={[styles.button]}
                  onPress={() => {
                    articleRepository
                      .changeStateSwapArticle(idSwapModale, session.user.id, 2)
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
                    setModalChoiceVisible(!modalChoiceVisible);
                  }}>
                  <Text style={styles.textStyle}>Oui</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    console.log('refuser');
                    articleRepository
                      .changeStateSwapArticle(idSwapModale, session.user.id, 1)
                      .then(res => {
                        console.log(res);
                      });
                    setModalChoiceVisible(!modalChoiceVisible);
                  }}>
                  <Text style={[styles.textStyle, styles.TextClose]}>Non</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={(event) => {
                    event.stopPropagation(); // Ajouter cette ligne pour éviter que le onPress du container ne soit appelé
                    navigation.navigate('SingleArticle', {
                      id: idArticleModale,
                      session: session,
                      showPropositionButton: false,
                    });
                  }}>
                  <Text style={[styles.textStyle, styles.TextClose]}>
                    Plus d'informations sur "{nomArticleModale1}"
                  </Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </ScrollView>

        <Pressable onPress={() => setActiveIndex(activeIndex === 1 ? -1 : 1)}>
          <View style={styles.header}>
            <Text style={styles.header_text}>Envoyées ({nbPropositionsEnvoyees})</Text>
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
          {nbPropositionsEnvoyees > 0 ? (
            swaps.map((swap: any) => {
              return (
                <View key={swap.id}>
                  {swap.id_profile_receiver !== session.user.id ? (
                    <View style={styles.swapContainer}>
                      <View style={styles.swapLeft}>
                        <Image
                          style={styles.image}
                          source={{
                            uri: imagesHelper.getPublicUrlByImageName(
                              swap.id_article_sender.articles_images[0]
                                .image_name,
                            ),
                          }}
                        />
                        <View>
                          <Text style={styles.swap_title}>
                            {swap.id_article_sender.title}
                          </Text>
                          <Text style={styles.Localisation}>
                            {swap.id_article_sender.location.cityName},{' '}
                            {locationHelper.getDistanceFromLatLonInKm(
                              swap.id_article_sender.location.latitude,
                              swap.id_article_sender.location.longitude,
                              location.coords.latitude,
                              location.coords.longitude,
                            )}
                            km
                          </Text>
                        </View>
                      </View>
                      <IconIco
                        name="swap-horizontal"
                        size={30}
                        color="#000"
                        style={styles.iconSwap}
                      />
                      <View style={styles.swapRight}>
                        <View>
                          <Text style={[styles.swap_title, styles.TextRight]}>
                            {swap.id_article_receiver.title}
                          </Text>
                          <Text style={[styles.Localisation, styles.TextRight]}>
                            {swap.id_article_receiver.location.cityName},{' '}
                            {locationHelper.getDistanceFromLatLonInKm(
                              swap.id_article_receiver.location.latitude,
                              swap.id_article_receiver.location.longitude,
                              location.coords.latitude,
                              location.coords.longitude,
                            )}
                            km
                          </Text>
                        </View>
                        <Image
                          style={styles.image}
                          source={{
                            uri: imagesHelper.getPublicUrlByImageName(
                              swap.id_article_receiver.articles_images[0]
                                .image_name,
                            ),
                          }}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })
          ) : (
            <Text>Vous n'avez pas envoyée de demande</Text>
          )}
        </ScrollView>

        <Pressable onPress={() => setActiveIndex(activeIndex === 2 ? -1 : 2)}>
          <View style={styles.header}>
            <Text style={styles.header_text}>Acceptées ({nbPropositionsAcceptees})</Text>
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
          {nbPropositionsAcceptees > 0 ? (
            swapsAccepted.map((swap: any) => {
              return (
                <View key={swap.id}>
                  {swap.state === 2 ? (
                    <View style={styles.swapContainer}>
                      <View style={styles.swapLeft}>
                        <Image
                          style={styles.image}
                          source={{
                            uri: imagesHelper.getPublicUrlByImageName(
                              swap.id_article_sender.articles_images[0]
                                .image_name,
                            ),
                          }}
                        />
                        <View>
                          <Text style={styles.swap_title}>
                            {swap.id_article_sender.title}
                          </Text>
                          <Text style={styles.Localisation}>
                            {swap.id_article_sender.location.cityName},{' '}
                            {locationHelper.getDistanceFromLatLonInKm(
                              swap.id_article_sender.location.latitude,
                              swap.id_article_sender.location.longitude,
                              location.coords.latitude,
                              location.coords.longitude,
                            )}
                            km
                          </Text>
                        </View>
                      </View>
                      <IconIco
                        name="swap-horizontal"
                        size={30}
                        color="#000"
                        style={styles.iconSwap}
                      />
                      <View style={styles.swapRight}>
                        <View>
                          <Text style={[styles.swap_title, styles.TextRight]}>
                            {swap.id_article_receiver.title}
                          </Text>
                          <Text style={[styles.Localisation, styles.TextRight]}>
                            {swap.id_article_receiver.location.cityName},{' '}
                            {locationHelper.getDistanceFromLatLonInKm(
                              swap.id_article_receiver.location.latitude,
                              swap.id_article_receiver.location.longitude,
                              location.coords.latitude,
                              location.coords.longitude,
                            )}
                            km
                          </Text>
                        </View>
                        <Image
                          style={styles.image}
                          source={{
                            uri: imagesHelper.getPublicUrlByImageName(
                              swap.id_article_receiver.articles_images[0]
                                .image_name,
                            ),
                          }}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })
          ) : (
            <Text>Vous n'avez pas envoyée de demande</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
  },
  Localisation: {
    color: '#696969',
    fontSize: 12,
    fontWeight: 'bold',
  },
  swapContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    gap: 10,
    borderRadius: 4,
    borderBottomWidth: 2,
  },
  swapLeft: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconSwap: {
    width: '10%',
    textAlign: 'center',
    transform: [{rotate: '90deg'}, {scaleX: -1}],
  },
  swapRight: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    alignItems: 'center',
  },
  TextRight: {
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    zIndex: 10,
    position: 'absolute',
  },
  button: {
    borderRadius: 4,
    height: 40,
    backgroundColor: '#5DB075',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    paddingTop: 8,
    width: '100%',
  },
  buttonClose: {
    backgroundColor: 'transparent',
  },
  TextClose: {
    color: '#000',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
});
