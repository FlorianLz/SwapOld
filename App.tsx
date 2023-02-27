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
import {NavigationContainer} from '@react-navigation/native';
import Home from './src/pages/Home';
import Profil from './src/pages/Profil';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Messagerie from './src/pages/Messagerie';
import HubPublication from './src/pages/HubPublication';
import Favoris from './src/pages/Favoris';
import SingleArticle from './src/pages/SingleArticle';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import locationHelper from "./src/helpers/location.helper";

const App = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
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
          options={{unmountOnBlur: true}}
        />
        {session && session.user ? (
          <>
            <Tab.Screen
              name="Messagerie"
              children={() => <Messagerie session={session} />}
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
