import {StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {supabase} from '../lib/initSupabase';
import messageService from '../services/message.service';
import messageFactory from '../factory/message.factory';
import {GiftedChat} from 'react-native-gifted-chat';
import 'dayjs/locale/fr';

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

  useEffect(() => {
    console.log('Hello from useEffect');
    messageService
      .getMessagesForArticle(article.id, session.user.id)
      .then(res => {
        setMessages(res);
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
          setMessages((previousMessages: never[] | undefined) =>
            GiftedChat.append(previousMessages, msg),
          );
        },
      )
      .subscribe();
  }, []);

  const onSend = useCallback(async (message: any = []) => {
    console.log('messages', message);
    await messageService.sendMessage(
      session.user.id,
      otherId,
      message[0].text,
      article.id,
    );
  }, []);

  return (
    <View style={styles.container}>
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
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    marginRight: 20,
    position: 'relative',
    height: '90%',
  },
  messagesContainer: {
    maxHeight: '60%',
    marginBottom: 20,
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
    width: '15%',
  },
  icon: {
    textAlign: 'center',
  },
  hideScroll: {
    maxHeight: '100%',
  },
});
