import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
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
  useEffect(() => {
    console.log('Hello from useEffect');
    messageService
      .getMessagesForArticle(article.id, session.user.id)
      .then(res => {
        setMessages(res);
        messageService
          .updateReadMessagesForArticle(article.id, session.user.id)
          .then(() => {
            console.log('messages updated');
          });
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
          let {new: newRecord} = payload;
          console.log('newRecord', newRecord);
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
            messageService
              .updateReadMessagesForArticle(article.id, session.user.id)
              .then(() => {
                console.log('messages updated');
              });
          }
        },
      )
      .subscribe();
  }, []);

  const onSend = useCallback(async (message: any = []) => {
    console.log('message cree', message);
    setMessages((previousMessages: IMessage[] | undefined) =>
      GiftedChat.append(previousMessages, message),
    );
    await messageService.sendMessage(
      session.user.id,
      otherId,
      message[0].text,
      article.id,
    );
  }, []);

  return (
    <View style={styles.container}>
      <Pressable style={styles.Header} onPress={() => navigation.goBack()}>
        <IconAnt style={styles.Icon} name="arrowleft" size={24} color="#000" />
        <Image style={styles.Image} source={{uri: article.ownerInfos.avatar_url}} />
        <View style={styles.containerHeaderInfos}>
          <Text style={styles.BackText}>{article.ownerInfos.username}</Text>
          <Text style={styles.BackSecond}>{article.title}</Text>
        </View>
      </Pressable>
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
      />
    </View>
  );
}
const styles = StyleSheet.create({
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
    fontFamily: 'Roboto',
    fontSize: 12,
  },
  BackText: {
    color: '#000',
    fontFamily: 'Roboto',
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
});
