import React, {useEffect, useState} from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Text} from 'react-native-elements';
import {useIsFocused} from '@react-navigation/native';
import Register from './auth/Register';
import Login from './auth/Login';

export default function Auth({route}: {params: {step: string}} | any) {
  const isFocused = useIsFocused();
  const [step, setStep] = useState(route.params?.step || 'Connexion');

  useEffect(() => {}, [isFocused]);

  /**
   * Affichage du composant Login ou Register en fonction de la valeur de la variable step
   */

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <Text
          h3
          style={Platform.OS === 'android' ? styles.title : styles.titleIOS}>
          {step}
        </Text>
        {step === 'Connexion' ? <Login /> : <Register />}
        {step === 'Connexion' ? (
          <>
            <View style={styles.inscription}>
              <Text style={styles.notRegister}>Pas encore inscrit ?</Text>
              <Pressable onPress={() => setStep('Inscription')}>
                <Text style={styles.registerLink}>Inscription</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.inscription}>
              <Text style={styles.notRegister}>Déjà inscrit ?</Text>
              <Pressable onPress={() => setStep('Connexion')}>
                <Text style={styles.registerLink}>Connexion</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Styles
 */

const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    marginRight: 20,
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  titleIOS: {
    textAlign: 'center',
    marginBottom: 20,
  },
  inscription: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    textAlign: 'center',
  },
  notRegister: {
    paddingRight: 10,
  },
  registerLink: {
    color: '#5DB075',
    textDecorationLine: 'underline',
  },
});
