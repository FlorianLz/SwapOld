import React from 'react';
import {Button, View} from 'react-native';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
export default function HubPublication({session}: {session: any}) {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <View>
      <Button
        title={'Ajouter un article'}
        onPress={() => navigation.navigate('AddArticle')}
      />
    </View>
  );
}
