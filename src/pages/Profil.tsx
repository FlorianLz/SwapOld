import {Text, View} from 'react-native';
import React from 'react';
import Account from "../components/Account";

export default function Profil({session}: {session: any}) {
  return (
    <View>
      <Text>Profil</Text>
      <View>
        <Account session={session} />
      </View>
    </View>
  );
}
