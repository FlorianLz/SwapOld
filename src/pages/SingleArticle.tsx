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
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/EvilIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMat from 'react-native-vector-icons/MaterialCommunityIcons';
import imageService from '../services/image.service';

export default ({route}: {params: {session: object; id: number}} | any) => {
  const {id, session} = route.params;
  const [article, setArticle] = React.useState<IArticleData>(
    {} as IArticleData,
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  useEffect(() => {
    articleService
      .getArticleById(id, session?.user.id)
      .then((result: IArticleData) => {
        setArticle(result as IArticleData);
        setLoading(true);
        setIsLiked(result.isLiked);
        console.log(result);
      });
  }, [id]);

  function handleDelete() {
    articleService.deleteArticle(article.id, session.user.id).then(result => {
      if (!result.error) {
        navigation.navigate('HubPublication');
      } else {
        console.log(result);
      }
    });
  }

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <>
          <View style={styles.Figure} />
          <Pressable style={styles.Header} onPress={() => navigation.goBack()}>
            <IconAnt
              style={styles.Icon}
              name="arrowleft"
              size={24}
              color="#000"
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
                        color="#000"
                      />
                    ) : (
                      <IconIon
                        style={styles.Icon}
                        name="ios-bookmark-outline"
                        size={24}
                        color="#000"
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
                      color="#000"
                    />
                  </Pressable>
                ) : (
                  <IconIon
                    style={[styles.Icon, styles.Hide]}
                    name="ios-bookmark"
                    size={24}
                    color="#000"
                  />
                )}
                <IconAnt
                  style={styles.Icon}
                  name="sharealt"
                  size={24}
                  color="#000"
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
            animationType="slide"
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
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => handleDelete()}>
                  <Text style={styles.textStyle}>Confirmer</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>Annuler</Text>
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
          <Pressable style={styles.Button}>
            <Text style={styles.ButtonText}>Proposer un échange</Text>
          </Pressable>
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
    backgroundColor: '#CCCCCC',
    borderBottomRightRadius: 30,
  },

  Header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 20,
  },
  Title: {
    color: '#000',
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
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
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
    backgroundColor: '#D9D9D9',
    height: 60,
    marginTop: 50,
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ButtonText: {
    color: '#000',
    fontFamily: 'Roboto',
    fontSize: 16,
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
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
