import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
export default function ListMessagerie({
  navigation,
  article,
  session,
  notRead,
}: {
  navigation: any;
  article: any;
  session: any;
  hideLike?: boolean;
  url?: string;
  article_sender?: any;
  notRead?: boolean;
}) {
  console.log('actualUser', article);
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
      <View
        style={
          notRead
            ? [styles.ListContainer, styles.notRead]
            : [styles.ListContainer]
        }>
        <Image style={styles.Image} source={{uri: article.images}} />
        <View style={styles.InfosContainer}>
          <Text style={styles.Name}>
            Échange avec{' '}
            {article.isOwner
              ? article.receiverInfos.username
              : article.ownerInfos.username}
          </Text>
          <Text style={styles.Title}>
            {article.title} contre {article.title2}{' '}
          </Text>
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
    width: '84%',
  },
  ListContainer: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 4,
    alignItems: 'center',
  },
  InfosContainer: {
    borderBottomWidth: 1,
    borderColor: 'black',
    paddingBottom: 16,
    width: '80%',
    borderBottomColor: '#E8E8E8',
    marginTop: 8,
  },
  Image: {
    height: 50,
    width: 50,
    resizeMode: 'cover',
    marginRight: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  notRead: {
    backgroundColor: '#D6D6D6',
  },
});
