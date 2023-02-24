import {StyleSheet, View} from 'react-native';
import React from 'react';
import ListArticles from '../components/articles/ListArticles';
export default function Home() {
  return (
    <View style={styles.container}>
      <ListArticles />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
});
