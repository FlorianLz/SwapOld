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
  //console.log('article', article);
  return (
    <View
      style={
        modeAffichage === 'mode1'
          ? styles.AffichageMode1
          : styles.AffichageMode2
      }>
      <Pressable
        onPress={() => navigation.navigate('SingleArticle', {id: article.id})}
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
              {article.location_name} ({article.distance} km)
            </Text>
          </View>
        </View>
        <View
          style={modeAffichage === 'mode1' ? styles.favoris : styles.favoris2}>
          <Pressable
            onPress={() => {
              console.log('favoris');
            }}>
            <Text style={styles.AddFav} />
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  AffichageMode1: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    width: '47%',
    marginBottom: 15,
    position: 'relative',
  },
  AffichageMode2: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 8,
    padding: 2,
    position: 'relative',
  },
  Affichage2: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
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
    backgroundColor: 'red',
    width: 30,
    height: 30,
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
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  Localisation: {
    color: '#696969',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ContainerImage: {
    width: '100%',
  },
  Image: {
    height: 185,
    width: '100%',
    resizeMode: 'cover',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  Image2: {
    height: 75,
    width: 75,
    resizeMode: 'cover',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
});
