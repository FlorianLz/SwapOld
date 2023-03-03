import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {useIsFocused} from '@react-navigation/native';
import Register from './auth/Register';
import Login from './auth/Login';

export default function Auth({route}: {params: {step: string}} | any) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(route.params.step);

  useEffect(() => {}, [isFocused]);

  return (
    <ScrollView style={styles.container}>
      <Text h3 style={styles.title}>
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
  );
}

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
