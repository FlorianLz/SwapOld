import {StyleSheet, View} from 'react-native';
import ListArticles from '../components/articles/ListArticles';
import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";
export default function Home() {
  const isFocused = useIsFocused();
  useEffect(() => {
    // Refresh the screen when the user comes back to it
  } , [isFocused]);
  return (
    <View style={styles.container}>
      {isFocused ? <ListArticles /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
});
