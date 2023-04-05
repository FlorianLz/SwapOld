import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {supabase} from '../../lib/initSupabase';
import {Text} from 'react-native-elements';
import locationService from '../../services/location.service';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
export default function CompleteProfile() {
  const [userName, setUserName] = React.useState('');
  const [session, setSession] = React.useState({});
  const [error, setError] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const navigation = useNavigation();

  React.useEffect(() => {
    //getSession supabase
    supabase.auth.getSession().then(session => {
      setSession(session.data.session ?? {});
    });
  }, []);

  const handleCompleteProfile = async () => {
    setLoadingUpdate(true);
    if (!/^[a-zA-Z0-9]+$/.test(userName)) {
      if (userName.length < 3 || userName.length > 10) {
        setError("Le nom d'utilisateur doit faire entre 3 et 10 caractères");
      } else {
        setError(
          "Le nom d'utilisateur ne doit contenir que des lettres et des chiffres",
        );
      }
      setLoadingUpdate(false);
      return;
    }

    if (
      !selectedItem.cityName ||
      !selectedItem.latitude ||
      !selectedItem.longitude
    ) {
      setError('Merci de sélectionner une ville dans la liste');
      setLoadingUpdate(false);
      return;
    }

    const {data, error} = await supabase
      .from('profiles')
      .update({
        username: userName,
        location: {
          cityName: selectedItem.cityName,
          latitude: selectedItem.latitude,
          longitude: selectedItem.longitude,
        },
        updated_at: new Date(),
        full_name: userName,
        avatar_url: 'default/avatar.png',
      })
      .eq('id', session.user.id);
    if (error) {
      if (error.code === '23505') {
        setError("Ce nom d'utilisateur est déjà utilisé");
      }
      if (error.code === '23514') {
        setError("Le nom d'utilisateur doit faire entre 3 et 10 caractères");
      }
      setLoadingUpdate(false);
    } else {
      setError('');
      navigation.navigate('HomePageScreen', {screen: 'HomePage'});
    }
    console.log(data, error);
  };

  const [loading, setLoading] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [suggestionsList, setSuggestionsList] = useState<
    {id: string; title: string}[]
  >([]);
  const [selectedItem, setSelectedItem] = useState<
    | {
        title: string;
        id: string;
        latitude: number;
        longitude: number;
        cityName: string;
      }
    | unknown
  >({
    id: '',
    title: '',
    latitude: 0,
    longitude: 0,
    cityName: '',
  });

  const getSuggestions = useCallback(async (q: string) => {
    const filterToken = q.toLowerCase();
    setCurrentSearch(filterToken);
    if (q.length < 3) {
      setSuggestionsList([]);
      setSelectedItem({
        cityName: '',
        id: '',
        latitude: 0,
        longitude: 0,
        title: '',
      });
      return;
    }
    setLoading(true);
    const suggestions = await locationService.getCitiesBySearch(filterToken);
    setSuggestionsList(suggestions);
    setLoading(false);
  }, []);

  const onClearPress = useCallback(() => {
    setSuggestionsList([]);
    setSelectedItem({
      cityName: '',
      id: '',
      latitude: 0,
      longitude: 0,
      title: '',
    });
    setCurrentSearch('');
  }, []);

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>
        Profil
      </Text>
      <Text style={styles.text}>
        Votre profil a bien été créé ! {'\n'}Merci de le compléter les
        informations suivantes pour pouvoir utiliser l'application.
      </Text>
      <Text style={styles.Title}>Nom d'utilisateur</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setUserName(text)}
        value={userName}
        placeholder="JohnDoe"
        autoCapitalize={'none'}
        placeholderTextColor={'#BDBDBD'}
      />
      <Text style={styles.Title}>Localisation</Text>
      <View style={[Platform.select({ios: {zIndex: 1}})]}>
        <AutocompleteDropdown
          direction={Platform.select({ios: 'down'})}
          dataSet={suggestionsList}
          onChangeText={getSuggestions}
          onSelectItem={item => {
            item && setSelectedItem(item);
          }}
          debounce={600}
          suggestionsListMaxHeight={Dimensions.get('window').height * 0.4}
          onClear={onClearPress}
          loading={loading}
          useFilter={false} // set false to prevent rerender twice
          textInputProps={{
            placeholder: 'Localisation...',
            autoCorrect: true,
            autoCapitalize: 'none',
            style: {
              backgroundColor: '#F6F6F6',
              height: 48,
              paddingLeft: 20,
              borderRadius: 4,
              borderColor: '#E8E8E8',
              borderWidth: 1,
              marginBottom: 8,
              color: '#BDBDBD',
              fontWeight: 'normal',
              fontSize: 14,
            },
          }}
          rightButtonsContainerStyle={{
            backgroundColor: '#F6F6F6',
            height: 47,
            marginTop: 1,
            marginRight: 1,
          }}
          inputContainerStyle={{
            borderRadius: 4,
            backgroundColor: '#F6F6F6',
            height: 47,
          }}
          suggestionsListContainerStyle={{
            backgroundColor: 'white',
            maxHeight: 165,
          }}
          containerStyle={{
            flexGrow: 1,
            flexShrink: 1,
            marginBottom: 16,
            borderColor: '#E8E8E8',
            height: 50,
            borderWidth: 1,
            borderRadius: 4,
          }}
          renderItem={item => <Text style={{padding: 15}}>{item.title}</Text>}
          EmptyResultComponent={
            <View>
              {currentSearch.length > 0 && (
                <Text style={{padding: 15}}>Aucun résultat</Text>
              )}
            </View>
          }
          ChevronIconComponent={
            <Feather name="chevron-down" size={20} color="#000" />
          }
          ClearIconComponent={
            <Feather name="x-circle" size={18} color="#000" />
          }
          inputHeight={50}
          showChevron={false}
          closeOnBlur={false}
        />
        <View style={{width: 10}} />
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
        onPress={handleCompleteProfile}
        disabled={loadingUpdate}>
        <Text style={styles.buttonText}>Valider</Text>
      </TouchableOpacity>

      <View style={styles.goHome}>
        <Pressable onPress={() => supabase.auth.signOut()}>
          <Text style={styles.registerLink}>Retourner à l'accueil</Text>
        </Pressable>
      </View>
    </View>
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
  text: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F6F6F6',
    height: 50,
    paddingLeft: 20,
    borderRadius: 4,
    borderColor: '#E8E8E8',
    borderWidth: 1,
    marginBottom: 8,
    fontWeight: 'normal',
  },
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
  registerLink: {
    color: '#5DB075',
    textDecorationLine: 'underline',
  },
  goHome: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    textAlign: 'center',
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
  Title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
