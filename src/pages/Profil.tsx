import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import IconAwe from 'react-native-vector-icons/FontAwesome5';
import IconMat from 'react-native-vector-icons/MaterialIcons';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {supabase} from '../lib/initSupabase';

export default function Profil({session}: {session: any}) {
  const actualUser = {
    id: session.user.id,
    name: session.user.username,
  };
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <View style={styles.Container}>
      <View style={styles.ContainerTop}>
        <View style={styles.Top}>
          <IconAwe
            name="edit"
            size={20}
            color="#fff"
            onPress={() => {
              navigation.navigate('UpdateProfil');
            }}
          />
          <Text style={styles.Title}>Profil</Text>
          <IconMat
            name="logout"
            size={20}
            color="#fff"
            onPress={() => supabase.auth.signOut()}
          />
        </View>
        <View style={styles.ContainerImage}>
          <View style={styles.ImageBackground}>
            <View style={styles.Image} />
          </View>
        </View>
      </View>
      <View style={styles.ContainerBottom}>
        <View style={styles.name}>{actualUser.name}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {},
  ContainerTop: {
    backgroundColor: '#000',
    height: 200,
    paddingLeft: 20,
    paddingRight: 20,
  },
  Top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
  },
  Title: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 28,
  },
  ContainerImage: {
    alignItems: 'center',
  },
  ImageBackground: {
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  Image: {
    width: 140,
    height: 140,
    backgroundColor: 'grey',
    borderRadius: 100,
  },
  name: {
    color: '#000',
  },
});
