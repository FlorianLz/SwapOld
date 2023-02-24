import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';

export default function SingleArticleCard({
  navigation,
  article,
  modeAffichage,
}: {
  navigation: any;
  article: any;
  modeAffichage: string;
}) {
  console.log('article', article);
  return (
    <Pressable
      onPress={() => navigation.navigate('SingleArticle', {id: article.id})}
      key={article.id}>
      <View
        style={
          modeAffichage === 'mode1'
            ? styles.affichageMode1
            : styles.affichageMode2
        }>
        <Text>{article.title}</Text>
        <Text>
          {article.location_name} ({article.distance} km)
        </Text>
        <Image
          source={{
            uri: article.images,
          }}
          style={{width: 500, height: 200, resizeMode: 'cover'}}
        />
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  affichageMode1: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  affichageMode2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
