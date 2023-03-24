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
import Auth from './src/components/Auth';
import {Session} from '@supabase/supabase-js';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import Home from './src/pages/Home';
import Profil from './src/pages/Profil';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Messagerie from './src/pages/Messagerie';
import Favoris from './src/pages/Favoris';
import SingleArticle from './src/pages/SingleArticle';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import IconMat from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFont from 'react-native-vector-icons/Fontisto';
import IconFea from 'react-native-vector-icons/Feather';
import IconOti from 'react-native-vector-icons/Octicons';
import AddArticle from './src/components/articles/AddArticle';
import SwapProposition from './src/components/SwapProposition';
import RecapProposition from './src/components/RecapProposition';
import MessagesScreen from './src/components/MessagesScreen';
import Account from './src/components/Account';
import { platform } from "os";
import { Platform } from "react-native";
const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('Hello from App.tsx useEffect');
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    if (Platform.OS === 'android') {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      })
        .then(data => {
          console.log(data);
        })
        .catch(err => {
          console.log(err);
        });

    }
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
          initialParams={{session: session}}
          component={SingleArticle}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddArticle"
          initialParams={{session: session}}
          component={AddArticle}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SwapProposition"
          initialParams={{session: session}}
          component={SwapProposition}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="RecapProposition"
          initialParams={{session: session}}
          component={RecapProposition}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MessagesScreen"
          initialParams={{session: session}}
          component={MessagesScreen}
          options={{headerShown: false, headerTitle: 'Messages'}}
        />
        <Stack.Screen
          name="UpdateProfil"
          initialParams={{session: session}}
          component={Account}
          options={{headerShown: true}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

  function HomeTabs() {
    const Tab = createBottomTabNavigator();
    return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarShowLabel: false,
          tabBarIcon: focused => {
            const icons: any = {
              HomePage: (
                <IconOti
                  name={'home'}
                  color={focused.focused ? '#000' : '#ccc'}
                  size={24}
                />
              ),
              Messagerie: (
                <IconMat
                  name={'message-processing-outline'}
                  color={focused.focused ? '#000' : '#ccc'}
                  size={24}
                />
              ),
              HubPublication: (
                <IconFont
                  name={'arrow-swap'}
                  color={focused.focused ? '#000' : '#ccc'}
                  size={24}
                  style={{transform: [{rotateY: '180deg'}]}}
                />
              ),
              Favoris: (
                <IconFea
                  name={'bookmark'}
                  color={focused.focused ? '#000' : '#ccc'}
                  size={24}
                />
              ),
              Profil: (
                <IconFea
                  name={'user'}
                  color={focused.focused ? '#000' : '#ccc'}
                  size={24}
                />
              ),
            };

            return icons[route.name];
          },
        })}>
        <Tab.Screen
          name="HomePage"
          children={() => <Home session={session} />}
          options={{unmountOnBlur: true, headerShown: false}}
        />
        {session && session.user ? (
          <>
            <Tab.Screen
              name="Messagerie"
              children={() => <Messagerie session={session} />}
              options={{tabBarBadge: 3, headerShown: false}}
            />
            <Tab.Screen
              name="HubPublication"
              component={AddArticle}
              initialParams={{session: session, hideRetour: true}}
              options={{headerShown: false}}
            />
            <Tab.Screen
              name="Favoris"
              children={() => <Favoris session={session} />}
              options={{headerShown: false}}
            />
            <Tab.Screen
              name="Profil"
              children={() => <Profil session={session} />}
              options={{headerShown: false}}
            />
          </>
        ) : (
          <>
            <Tab.Screen
              name="Messagerie"
              component={Auth}
              initialParams={{step: 'Connexion'}}
              options={{headerShown: false}}
            />
            <Tab.Screen
              name="HubPublication"
              component={Auth}
              initialParams={{step: 'Connexion'}}
              options={{headerShown: false}}
            />
            <Tab.Screen
              name="Favoris"
              component={Auth}
              initialParams={{step: 'Connexion'}}
              options={{headerShown: false}}
            />
            <Tab.Screen
              name="Profil"
              component={Auth}
              initialParams={{step: 'Connexion'}}
              options={{headerShown: false}}
            />
          </>
        )}
      </Tab.Navigator>
    );
  }
};
export default App;
