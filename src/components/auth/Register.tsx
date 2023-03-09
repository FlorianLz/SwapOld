import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {supabase} from '../../lib/initSupabase';
import {Button, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import authHelper from '../../helpers/auth.helper';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [viewPassword, setViewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function signUpWithEmail() {
    //Vérification de l'email et du mot de passe
    if (email === '' || password === '') {
      setError('Tous les champs doivent être remplis');
    } else {
      let errorInputs = false;
      //Check si l'email est valide
      if (!authHelper.checkEmailIsValid(email)) {
        errorInputs = true;
        setError("Merci d'entrer une adresse email valide");
      } else {
        //Check si le mot de passe est valide
        if (!authHelper.checkPasswordIsValid(password)) {
          errorInputs = true;
          setError(
            'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.',
          );
        } else {
          if (password !== confirmPassword) {
            errorInputs = true;
            setError('Les mots de passe ne sont pas identiques.');
          }
        }
      }
      if (!errorInputs) {
        setLoading(true);
        let auth = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        console.log(auth.error);
        if (auth.error) {
          let err: string = String(auth.error);
          if (err === 'AuthApiError: User already registered') {
            setError('Un compte existe déjà avec cette adresse email.');
          } else {
            setError(
              'Une erreur est survenue lors de la création du compte. Merci de réessayer.',
            );
          }
        }
        setLoading(false);
      }
    }
  }

  return (
    <ScrollView>
      <View>
        <TextInput
          style={styles.input}
          onChangeText={text => setEmail(text)}
          value={email}
          placeholder="Email"
          autoCapitalize={'none'}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            onChangeText={text => setPassword(text)}
            value={password}
            secureTextEntry={!viewPassword}
            placeholder="Mot de passe..."
            autoCapitalize={'none'}
          />
          {viewPassword ? (
            <Icon
              name="eye-off-outline"
              color="#000"
              size={24}
              style={styles.icon}
              onPress={() => setViewPassword(!viewPassword)}
            />
          ) : (
            <Icon
              name="eye-outline"
              color="#000"
              size={24}
              style={styles.icon}
              onPress={() => setViewPassword(!viewPassword)}
            />
          )}
        </View>
        <TextInput
          style={styles.input}
          onChangeText={text => setConfirmPassword(text)}
          value={confirmPassword}
          secureTextEntry={true}
          placeholder="Confirmation du mot de passe..."
          autoCapitalize={'none'}
        />
      </View>
      {error !== '' && (
        <>
          <View style={styles.errorMessage}>
            <Text style={styles.errorMessageText}>{error}</Text>
          </View>
        </>
      )}
      <TouchableOpacity
        style={styles.button}
        disabled={loading}
        onPress={() => signUpWithEmail()}>
        <Text style={styles.buttonText}>Inscription</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: '#5DB075',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    display: 'flex',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    backgroundColor: '#F6F6F6',
    paddingLeft: 20,
    width: '100%',
    borderRadius: 8,
    borderColor: '#E8E8E8',
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderColor: '#000',
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  icon: {
    position: 'absolute',
    top: 33,
    right: 20,
  },
  errorMessage: {
    color: 'red',
    marginTop: 20,
    borderColor: 'red',
    borderWidth: 1,
    minHeight: 50,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  errorMessageText: {
    color: 'red',
    textAlign: 'center',
  },
});