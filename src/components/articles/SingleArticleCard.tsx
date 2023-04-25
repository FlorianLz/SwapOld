import {Image, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/EvilIcons';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconFeather from 'react-native-vector-icons/Feather';
import articleService from '../../services/article.service';
import articleRepository from '../../repository/article.repository';
export default function SingleArticleCard({
  navigation,
  article,
  modeAffichage,
  session,
  hideLike = false,
  url,
  article_sender,
}: {
  navigation: any;
  article: any;
  modeAffichage: string;
  session: any;
  hideLike?: boolean;
  url?: string;
  article_sender?: any;
}) {
  const [isLiked, setIsLiked] = React.useState<boolean>(
    article.isLiked ?? false,
  );
  const [error, setError] = useState<string>('');
  const [modalChoiceVisible, setModalChoiceVisible] = useState(false);
  useEffect(() => {
    console.log('article', modeAffichage);
    console.log('article', article)
  }, []);
  return (
    <View
      style={[
        modeAffichage === 'mode1'
          ? styles.AffichageMode1
          : styles.AffichageMode2,
        modeAffichage === 'mode2' && article.status !== 0
          ? styles.ArticleNonDispo
          : null,
      ]}>
      <Pressable
        onPress={() => {
          {
            url === 'SwapProposition'
              ? setModalChoiceVisible(true)
              : url === 'Messagerie'
              ? navigation.navigate('MessagesScreen', {
                  session: session,
                  article: article,
                })
              : navigation.navigate('SingleArticle', {id: article.id});
          }
        }}
        key={article.id}>
        <View style={modeAffichage === 'mode2' ? styles.Affichage2 : null}>
          <Image
            source={{uri: article.images}}
            style={modeAffichage === 'mode1' ? styles.Image : styles.Image2}
          />
          <View
            style={modeAffichage === 'mode1' ? styles.Infos : styles.Infos2}>
            <Text style={styles.Title}>{article.title}</Text>
            <Text style={styles.Localisation}>
              <Icon name="location" size={14} color="#696969" />
              {article.location_name} ({article.distance} km)
            </Text>
          </View>
        </View>
        <View
          style={modeAffichage === 'mode1' ? styles.favoris : styles.favoris2}>
          {!article.isOwner && (
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
              {session?.user && !hideLike && !article.isOwner && (
                <View
                  style={
                    isLiked ? [styles.AddFav, styles.isLiked] : styles.AddFav
                  }>
                  {!isLiked ? (
                    <IconIon
                      name="ios-bookmark-outline"
                      size={16}
                      color="#000"
                    />
                  ) : (
                    <IconIon name="ios-bookmark" size={16} color="#000" />
                  )}
                </View>
              )}
            </Pressable>
          )}
          {article.isOwner && (
            <Pressable>
              <View style={styles.AddFav}>
                <IconFeather name="edit" size={20} color="#000" />
              </View>
            </Pressable>
          )}
        </View>
      </Pressable>
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
              Vous souhaitez proposer un échange avec cette proposition ?
            </Text>
            <Pressable
              style={[styles.button]}
              onPress={() => {
                articleRepository
                  .swapArticle(
                    session.user.id,
                    article_sender.article.id_profile,
                    article_sender.article.id,
                    article.id,
                  )
                  .then(result => {
                    if (!result.error) {
                      navigation.navigate('Profil');
                    } else {
                      setError(
                        'Vous avez deja proposé un échange pour cet article',
                      );
                    }
                  });
                setModalChoiceVisible(false);
              }}>
              <Text style={styles.textStyle}>oui</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalChoiceVisible(!modalChoiceVisible)}>
              <Text style={[styles.textStyle, styles.TextClose]}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  AffichageMode1: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 4,
    backgroundColor: 'white',
    elevation: 2,
    borderBottomColor: '#5DB075',
    borderBottomWidth: 3,
    width: '47%',
    marginBottom: 15,
    position: 'relative',
  },
  AffichageMode2: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 2,
    position: 'relative',
    borderColor: '#5DB075',
    borderBottomWidth: 3,
    borderBottomLeftRadius: 4,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  Affichage2: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  favoris: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  favoris2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 10,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  AddFav: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  isLiked: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  Infos: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 55,
    width: '100%',
    padding: 10,
  },
  Infos2: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 75,
    padding: 10,
  },
  Title: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  Localisation: {
    color: '#696969',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ContainerImage: {
    width: '100%',
  },
  Image: {
    height: 185,
    width: '100%',
    resizeMode: 'cover',
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
  },
  Image2: {
    height: 75,
    width: 75,
    resizeMode: 'cover',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
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
  modalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  ArticleNonDispo: {
    borderColor: '#F04242',
  },
});
