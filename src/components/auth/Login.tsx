import {supabase} from '../../lib/initSupabase';
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import authHelper from '../../helpers/auth.helper';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);
  const [error, setError] = useState('');

  /**
   * Cette fonction permet de se connecter avec l'email et le mot de passe fournis par l'utilisateur.
   * Elle vérifie que l'email et le mot de passe sont remplis, puis vérifie si l'email est valide.
   * Si les champs sont valides, elle appelle la fonction signInWithPassword de Supabase pour tenter de se connecter.
   * @throws {Error} Lance une erreur si l'authentification a échoué.
   */
  async function signInWithPassword() {
    // Vérifie que les champs email et password sont remplis
    if (email === '' || password === '') {
      setError('Tous les champs doivent être remplis');
    } else {
      let errorInputs = false;
      // Vérifie si l'email est valide
      if (!authHelper.checkEmailIsValid(email)) {
        errorInputs = true;
        setError("Merci d'entrer une adresse email valide");
      }
      // Si l'email et le mot de passe sont valides, tente de se connecter
      if (!errorInputs) {
        // Active l'état `loading` pour afficher une indication de chargement
        setLoading(true);
        // Appelle la fonction signInWithPassword de Supabase pour tenter de se connecter
        let auth = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        // Si l'authentification a échoué, déclenche une erreur
        if (auth.error) {
          setError('Identifiants invalides. Merci de réessayer.');
          throw new Error('Authentification échouée');
        }
        // Désactive l'état `loading` pour masquer l'indication de chargement
        setLoading(false);
      }
    }
  }

  /**
   * Permet de se connecter sur l'application
   */

  return (
    <ScrollView>
      <View>
        <TextInput
          style={styles.input}
          onChangeText={text => setEmail(text)}
          value={email}
          placeholder="Email"
          autoCapitalize={'none'}
          placeholderTextColor={'#000'}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            onChangeText={text => setPassword(text)}
            value={password}
            secureTextEntry={!viewPassword}
            placeholder="Mot de passe..."
            placeholderTextColor={'#000'}
            autoCapitalize={'none'}
          />
          {viewPassword ? (
            <Icon
              name="eye-outline"
              color="#000"
              size={24}
              style={styles.icon}
              onPress={() => setViewPassword(!viewPassword)}
            />
          ) : (
            <Icon
              name="eye-off-outline"
              color="#000"
              size={24}
              style={styles.icon}
              onPress={() => setViewPassword(!viewPassword)}
            />
          )}
        </View>
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
        onPress={() => signInWithPassword()}>
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * Styles
 */

const styles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: '#5DB075',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    display: 'flex',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    color: '#000',
    height: 50,
    backgroundColor: '#F6F6F6',
    paddingLeft: 20,
    width: '100%',
    borderRadius: 4,
    borderColor: '#E8E8E8',
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderColor: '#000',
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
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
    borderRadius: 4,
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
