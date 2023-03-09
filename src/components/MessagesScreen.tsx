import {Text} from 'react-native-elements';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import React, { useEffect, useRef } from "react";
import {supabase} from '../lib/initSupabase';
import messageService from '../services/message.service';
import messageFactory from '../factory/message.factory';
import Icon from 'react-native-vector-icons/Ionicons';

export default function MessagesScreen({
  route,
}: {params: {article: object; session: any}} | any) {
  const {article, session} = route.params;
  const [messages, setMessages] = React.useState<object[]>([]);
  const [msgInput, setMsgInput] = React.useState<string>('');
  const scrollViewRef = useRef<any>(null);
  const otherId: string = !article.isOwner
    ? article.ownerInfos.id
    : article.receiverInfos.id;

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
          let msg = messageFactory.formatNewMessageReceived(
            newRecord,
            session.user.id,
          );
          updateMessages(msg);
        },
      )
      .subscribe();
  }, [messages]);

  function updateMessages(newMessage: any) {
    setMessages([...messages, newMessage]);
    console.log([...messages, newMessage]);
  }

  async function handleSend() {
    let send = await messageService.sendMessage(
      session.user.id,
      otherId,
      msgInput,
      article.id,
    );
    console.log('send', send);
    if (!send.error) {
      setMsgInput('');
    }
  }

  function scrollViewSizeChanged() {
    scrollViewRef.current !== null
      ? scrollViewRef.current.scrollToEnd({animated: true})
      : null;
  }

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>
        Chat avec {article.ownerInfos.username}
      </Text>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => {
          scrollViewSizeChanged();
        }}
        style={styles.messagesContainer}>
        {messages && messages.length > 0 ? (
          messages.map((message: any) => {
            return (
              <Text key={message.id}>
                {message.isSender
                  ? article.ownerInfos.username
                  : article.receiverInfos.username}{' '}
                : {message.message}
              </Text>
            );
          })
        ) : (
          <Text>
            Vous n'avez pas encore échangé de messages avec cette utilisateur.
          </Text>
        )}
      </ScrollView>
      <KeyboardAvoidingView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          value={msgInput}
          onChangeText={text => setMsgInput(text)}
        />
        {msgInput.length > 0 && (
          <Pressable onPress={handleSend} style={styles.iconContainer}>
            <Icon name="send" color="#000" size={24} style={styles.icon} />
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    marginRight: 20,
    position: 'relative',
    height: '100%',
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
});
