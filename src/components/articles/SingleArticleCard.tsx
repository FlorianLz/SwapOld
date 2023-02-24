import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {supabase} from '../../lib/initSupabase';

export default function SingleArticleCard({
  navigation,
  article,
  modeAffichage,
}: {
  navigation: any;
  article: any;
  modeAffichage: string;
}) {
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
        {article.articles_images.map(
          (item: {id: React.Key | null | undefined; image_name: string}) => (
            <React.Fragment key={item.id}>
              <Image
                source={{
                  uri: supabase.storage
                    .from('swapold')
                    .getPublicUrl(item.image_name).data.publicUrl,
                }}
                style={{width: 500, height: 200, resizeMode: 'cover'}}
              />
            </React.Fragment>
          ),
        )}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
  affichageMode1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  affichageMode2: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
