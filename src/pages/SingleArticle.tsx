import {
  Pressable,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import articleService from '../services/article.service';
import IArticleData from '../interfaces/articleInterface';
import {
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/EvilIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMat from 'react-native-vector-icons/MaterialCommunityIcons';
export default ({route}: {params: {session: object; id: number}} | any) => {
  const {id, session} = route.params;
  const [article, setArticle] = React.useState<IArticleData>(
    {} as IArticleData,
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalChoiceVisible, setModalChoiceVisible] = useState(false);
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    articleService
      .getArticleById(id, session?.user.id)
      .then((result: IArticleData) => {
        setArticle(result as IArticleData);
        setLoading(true);
        setIsLiked(result.isLiked);
      });
  }, [isFocused]);

  function handleDelete() {
    articleService.deleteArticle(article.id, session.user.id).then(result => {
      if (!result.error) {
        navigation.navigate('HomePageScreen', {screen: 'Profil'});
      } else {
        //console.log(result);
      }
    });
  }

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <>
          <View style={[styles.Figure, article.status !== 0 ? styles.ButtonTextNonDispo : null]} />
          <Pressable style={styles.Header} onPress={() => navigation.goBack()}>
            <IconAnt
              style={styles.Icon}
              name="arrowleft"
              size={24}
              color="#fff"
            />
            <Text style={styles.Title}>{article.title}</Text>
          </Pressable>
          <View style={styles.Top}>
            <Image
              source={{
                uri: article.images[0] + '?width=150&height=100',
              }}
              style={styles.Image}
            />
            <View style={styles.RightImage}>
              <View style={styles.RightImageIcon}>
                {session?.user && !article.isOwner ? (
                  <Pressable
                    onPress={() => {
                      articleService
                        .toggleLikeArticle(article.id, session.user.id)
                        .then(result => {
                          if (!result.error) {
                            setIsLiked(result.isLiked);
                          }
                        });
                    }}>
                    {isLiked ? (
                      <IconIon
                        style={styles.Icon}
                        name="ios-bookmark"
                        size={24}
                        color="#fff"
                      />
                    ) : (
                      <IconIon
                        style={styles.Icon}
                        name="ios-bookmark-outline"
                        size={24}
                        color="#fff"
                      />
                    )}
                  </Pressable>
                ) : article.isOwner ? (
                  <Pressable
                    onPress={() => {
                      console.log('edit');
                      setModalVisible(true);
                    }}>
                    <IconMat
                      style={[styles.Icon]}
                      name="delete"
                      size={20}
                      color="#fff"
                    />
                  </Pressable>
                ) : (
                  <IconIon
                    style={[styles.Icon, styles.Hide]}
                    name="ios-bookmark"
                    size={24}
                    color="#fff"
                  />
                )}
                <IconAnt
                  style={styles.Icon}
                  name="sharealt"
                  size={24}
                  color="#fff"
                />
              </View>
              <View>
                {typeof article.images !== 'string'
                  ? article.images?.map((image: string, index: number) => {
                      if (index > 0 && index < 5) {
                        return (
                          <Image
                            key={index}
                            style={styles.ImageMinify}
                            source={{uri: article.images[1]}}
                          />
                        );
                      }
                    })
                  : null}
              </View>
            </View>
          </View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  Voulez-vous vraiment supprimer cet article ?
                </Text>
                <Pressable
                  style={[styles.button]}
                  onPress={() => handleDelete()}>
                  <Text style={styles.textStyle}>Confirmer</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={[styles.textStyle, styles.TextClose]}>
                    Annuler
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <View style={styles.Bottom}>
            <View>
              <Text style={styles.TextTitle}>Localisation</Text>
              <Text style={styles.TextSubtitle}>
                <Icon name="location" size={16} color="#696969" />
                {article.location_name} ({article.distance} km)
              </Text>
            </View>
            <View>
              <Text style={styles.TextTitle}>Description</Text>
              <Text style={styles.TextSubtitle}>{article.description}</Text>
            </View>
            <View>
              <Text style={styles.TextTitle}>Posté par</Text>
              <Text style={styles.TextSubtitle}>
                {article?.username} le
                {' ' + new Date(article?.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          {session?.user && !article.isOwner && article.status === 0 && (
            <Pressable
              style={styles.Button}
              onPress={() => {
                console.log('edit');
                setModalChoiceVisible(true);
              }}>
              <Text style={styles.ButtonText}>Proposer un échange</Text>
            </Pressable>
          )}
          {session?.user && !article.isOwner && article.status !== 0 && (
            <View style={[styles.Button, styles.ButtonTextNonDispo]}>
              <Text style={styles.ButtonText}>Article non disponible</Text>
            </View>
          )}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalChoiceVisible}
            onRequestClose={() => {
              setModalChoiceVisible(!modalChoiceVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  Vous souhaitez proposer un échange pour cet objet. Vous avez
                  Vous avez la possibilité de proposer un nouvel article
                  uniquement pour cet échanger, ou de sélectionner un article
                  parmi ceux que vous avez déjà mis en ligne.
                </Text>
                <Pressable
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
                    navigation.navigate('AddArticle', {
                      privateArticle: true,
                      article_sender: {article},
                    });
                    setModalChoiceVisible(false);
                  }}>
                  <Text style={[styles.textStyle, styles.textStyleSecondary]}>
                    Ajouter un nouvel article
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.button]}
                  onPress={() => {
                    navigation.navigate('SwapProposition', {
                      article_sender: {article},
                    });
                    setModalChoiceVisible(false);
                  }}>
                  <Text style={styles.textStyle}>
                    Choisir un article déjà publié
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalChoiceVisible(!modalChoiceVisible)}>
                  <Text style={[styles.textStyle, styles.TextClose]}>
                    Annuler
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  Figure: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 210,
    backgroundColor: '#5DB075',
    borderBottomRightRadius: 4,
  },

  Header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 20,
  },
  Title: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 28,
  },
  Icon: {
    marginLeft: 20,
    marginRight: 20,
  },

  container: {
    flex: 1,
    marginBottom: 20,
  },

  Top: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  Image: {
    width: '80%',
    minHeight: 430,
    resizeMode: 'cover',
    borderBottomRightRadius: 4,
    borderTopRightRadius: 4,
  },
  RightImage: {
    width: '20%',
    alignItems: 'center',
  },
  RightImageIcon: {
    gap: 20,
    marginBottom: 75,
  },
  ImageMinify: {
    backgroundColor: 'grey',
    width: 50,
    height: 50,
    margin: 4,
    borderRadius: 10,
  },

  Bottom: {
    paddingLeft: 20,
    PaddingRight: 20,
  },
  TextTitle: {
    color: '#696969',
    fontFamily: 'Roboto',
    fontWeight: 'normal',
    fontSize: 16,
    paddingBottom: 8,
    paddingTop: 12,
  },
  TextSubtitle: {
    color: '#000000',
    fontSize: 14,
  },

  Button: {
    backgroundColor: '#5DB075',
    height: 60,
    marginTop: 50,
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#5DB075',
  },
  ButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 16,
    textAlign: 'center',
  },
  Hide: {
    backfaceVisibility: 'hidden',
    opacity: 0,
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
  textStyleSecondary: {
    color: '#5DB075',
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  ButtonTextNonDispo: {
    backgroundColor: '#F04242',
  }
});
