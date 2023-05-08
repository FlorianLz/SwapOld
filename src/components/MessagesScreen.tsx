import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {supabase} from '../lib/initSupabase';
import messageService from '../services/message.service';
import messageFactory from '../factory/message.factory';
import {GiftedChat, IMessage, Send} from 'react-native-gifted-chat';
import 'dayjs/locale/fr';
import Icon from 'react-native-vector-icons/Ionicons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import articleRepository from '../repository/article.repository';

export default function MessagesScreen({
  route,
}: {params: {article: object; session: any}} | any) {
  const {article, session} = route.params;
  const otherId: string = !article.isOwner
    ? article.ownerInfos.id
    : article.receiverInfos.id;
  const actualUser = {
    id: session.user.id,
    name: article.isOwner
      ? article.ownerInfos.username
      : article.receiverInfos.username,
    avatar: article.isOwner
      ? article.ownerInfos.avatar_url
      : article.receiverInfos.avatar_url,
  };
  const otherUser = {
    id: otherId,
    name: !article.isOwner
      ? article.ownerInfos.username
      : article.receiverInfos.username,
    avatar: !article.isOwner
      ? article.ownerInfos.avatar_url
      : article.receiverInfos.avatar_url,
  };
  const [messages, setMessages] = useState<any>([]);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [echangeTermine, setEchangeTermine] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    console.log(article);
    setEchangeTermine(article.status2);
    messageService
      .getMessagesForArticle(article.id, session.user.id)
      .then(res => {
        setMessages(res);
        messageService.updateReadMessagesForArticle(
          article.id,
          session.user.id,
        );
      });
  }, []);

  useEffect(() => {
    supabase
      .channel('value-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'articles_chat_profiles',
          filter: 'id_article=eq.' + article.id,
        },
        payload => {
          console.log('UPDATE REALTIME');
          let {new: newRecord} = payload;
          let userToAdd =
            newRecord.id_first_profile === session.user.id
              ? actualUser
              : otherUser;
          let msg = messageFactory.formatNewMessageReceived(
            newRecord,
            session.user.id,
            userToAdd,
          );
          //add message only if it's not the current user
          if (msg?.user?._id !== session.user.id) {
            setMessages((previousMessages: IMessage[] | undefined) =>
              GiftedChat.append(previousMessages, msg as any),
            );
            console.log('UPD');
            messageService
              .updateReadMessagesForArticle(article.id, session.user.id)
              .then(() => {});
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const onSend = useCallback(async (message: any = []) => {
    setMessages((previousMessages: IMessage[] | undefined) =>
      GiftedChat.append(previousMessages, message),
    );
    await messageService.sendMessage(
      session.user.id,
      otherId,
      message[0].text,
      article.id,
      false,
    );
  }, []);

  const handleValidate = async () => {
    console.log(article.id);
    const valider = await articleRepository.updateArticleEchangeValide(
      article.id,
    );
    const {error} = valider;
    if (!error) {
      setEchangeTermine(true);
      setModalVisible(!modalVisible);
      const echangeValide = await articleRepository.getEchangeValide(
        article.id2,
      );
      const {data} = echangeValide;
      if (!data || data[0].echange_valide) {
        await articleRepository.updateArticleStatus(article.id);
        await articleRepository.updateArticleStatus(article.id2);
      }
    }
  };

  return (
    <SafeAreaView>
      <View style={[styles.container]}>
        <View style={styles.containerHeader}>
          <Pressable style={styles.Header} onPress={() => navigation.goBack()}>
            <IconAnt
              style={styles.Icon}
              name="arrowleft"
              size={24}
              color="#000"
            />
            <Image style={styles.Image} source={{uri: article.images}} />
            <View style={styles.containerHeaderInfos}>
              <Text style={styles.BackText}>{otherUser.name}</Text>
              <Text style={styles.BackSecond}>{article.title}</Text>
            </View>
          </Pressable>
          {!echangeTermine ? (
            <Pressable onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.BackSecond}>Valider l'échange</Text>
            </Pressable>
          ) : (
            <Text style={styles.BackSecond}>Échange terminé</Text>
          )}
        </View>
        <GiftedChat
          inverted={true}
          locale={'fr'}
          dateFormat={'DD/MM/YYYY'}
          timeFormat={'HH:mm'}
          placeholder={'Écrivez votre message ici...'}
          messages={messages}
          onSend={onSend}
          listViewProps={{
            style: styles.hideScroll,
            showsVerticalScrollIndicator: false,
          }}
          user={{
            _id: session.user.id,
            name: article.isOwner
              ? article.ownerInfos.username
              : article.receiverInfos.username,
            avatar: article.isOwner
              ? article.ownerInfos.avatar_url
              : article.receiverInfos.avatar_url,
          }}
          renderSend={props => {
            return (
              <Send {...props} containerStyle={styles.sendContainer}>
                <Icon style={styles.icon} name="send" size={20} color="#000" />
              </Send>
            );
          }}
          renderBubble={props => {
            return (
              <View
                style={{
                  backgroundColor:
                    props.currentMessage?.user?._id === session.user.id
                      ? '#5DB075'
                      : '#D9D9D9',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}>
                <Text
                  style={{
                    color:
                      props.currentMessage?.user?._id === session.user.id
                        ? '#fff'
                        : '#000',
                  }}>
                  {props.currentMessage?.text}
                </Text>
              </View>
            );
          }}
          renderChatEmpty={() => {
            return (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Vous pouvez commencer à discuter avec {otherUser.name}{' '}
                  concernant l'échange suivant :
                </Text>
                <Text style={styles.emptyText}>
                  {article.title} contre {article.title2}{' '}
                </Text>
              </View>
            );
          }}
        />
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
            <Text style={styles.modalText}>Valider l'échange ?</Text>
            <Pressable style={[styles.button]} onPress={() => handleValidate()}>
              <Text style={styles.textStyle}>Confirmer</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={[styles.textStyle, styles.TextClose]}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  Header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 20,
  },
  containerHeaderInfos: {
    flexDirection: 'column',
  },
  BackSecond: {
    color: '#000',
    fontFamily: 'System',
    fontSize: 12,
  },
  BackText: {
    color: '#000',
    fontFamily: 'System',
    fontSize: 16,
  },
  Icon: {
    marginRight: 10,
  },

  container: {
    marginLeft: 20,
    marginRight: 20,
    position: 'relative',
    height: '100%',
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    borderColor: '#000',
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    position: 'absolute',
    bottom: 70,
  },
  input: {
    height: 50,
    backgroundColor: '#F6F6F6',
    paddingLeft: 20,
    width: '85%',
    borderRadius: 8,
    borderColor: '#E8E8E8',
    borderWidth: 1,
  },
  iconContainer: {
    width: 30,
  },
  icon: {
    textAlign: 'center',
  },
  hideScroll: {
    maxHeight: '100%',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  Image: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  emptyText: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#000',
    transform: [{scaleY: -1}],
    textAlign: 'center',
    padding: 5,
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
  },
});
