import * as React from 'react';
import {Button} from 'react-native';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export default function GoToButton({screenName}: {screenName: string}) {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  /**
   * Bouton de navigation vers l'écran passé en paramètre
   */

  return (
    <Button
      title={`Go to ${screenName}`}
      onPress={() => navigation.navigate(screenName)}
    />
  );
}
