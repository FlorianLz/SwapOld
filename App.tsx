/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {supabase} from './src/lib/initSupabase';
import Auth from './src/components/Login';
import {Session} from '@supabase/supabase-js';
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import Home from './src/pages/Home';
import Profil from './src/pages/Profil';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Messagerie from './src/pages/Messagerie';
import HubPublication from './src/pages/HubPublication';
import Favoris from './src/pages/Favoris';
import SingleArticle from './src/pages/SingleArticle';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import { StyleSheet } from "react-native";

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    }).then(() => {
      //Reload the app with the location on
      setLoading(true);
    });
  }, []);

  const SwapOldTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: 'rgb(255, 45, 85)',
      background: '#fff',
      card: '#fff',
    },
  };
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer theme={SwapOldTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{headerShown: false}}
          component={HomeTabs}
        />
        <Stack.Screen
          name="SingleArticle"
          initialParams={{params: {session: session}}}
          component={SingleArticle}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

  function HomeTabs() {
    const Tab = createBottomTabNavigator();
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="HomePage"
          component={Home}
          options={{unmountOnBlur: true, headerShown: false}}
        />
        {session && session.user ? (
          <>
            <Tab.Screen
              name="Messagerie"
              children={() => <Messagerie session={session} />}
              options={{tabBarBadge: 3}}
            />
            <Tab.Screen
              name="HubPublication"
              children={() => <HubPublication session={session} />}
            />
            <Tab.Screen
              name="Favoris"
              children={() => <Favoris session={session} />}
            />
            <Tab.Screen
              name="Profil"
              children={() => <Profil session={session} />}
            />
          </>
        ) : (
          <>
            <Tab.Screen name="Messagerie" component={Auth} />
            <Tab.Screen name="HubPublication" component={Auth} />
            <Tab.Screen name="Favoris" component={Auth} />
            <Tab.Screen name="Profil" component={Auth} />
          </>
        )}
      </Tab.Navigator>
    );
  }
};
export default App;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: '#fff',
  },
});
