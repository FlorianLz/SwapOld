import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
export default function ListMessagerie({
  navigation,
  article,
  session,
}: {
  navigation: any;
  article: any;
  session: any;
  hideLike?: boolean;
  url?: string;
  article_sender?: any;
}) {
  const actualUser = {
    id: session.user.id,
    name: article.isOwner
      ? article.ownerInfos.username
      : article.receiverInfos.username,
    avatar: article.isOwner
      ? article.ownerInfos.avatar_url
      : article.receiverInfos.avatar_url,
  };
  return (
    <Pressable
      style={styles.Container}
      onPress={() => {
        {
          navigation.navigate('MessagesScreen', {
            session: session,
            article: article,
          });
        }
      }}
      key={article.id}>
      <View style={styles.ListContainer}>
        <Image style={styles.Image} source={{uri: article.images}} />
        <View style={styles.InfosContainer}>
          <Text style={styles.Name}>{actualUser.name}</Text>
          <Text style={styles.Title}>{article.title}</Text>
        </View>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  Container: {
    width: '100%',
  },
  Name: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  Title: {
    color: 'black',
    fontSize: 14,
  },
  ListContainer: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 4,
  },
  InfosContainer: {
    borderBottomWidth: 1,
    borderColor: 'black',
    paddingBottom: 16,
    width: '100%',
    borderBottomColor: '#E8E8E8',
  },
  Image: {
    height: 50,
    width: 50,
    resizeMode: 'cover',
    marginRight: 16,
    borderRadius: 8,
  },
});