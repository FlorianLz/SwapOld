import React, {useState} from 'react';
import {TextInput, StyleSheet, View, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  onSubmit: (searchTerm: string, filterEnabled: boolean) => void;
}

const SearchBar: React.FC<Props> = ({onSubmit}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState(false);

  /**
   * Fonction qui sera appelée lorsque le formulaire de recherche sera soumis.
   * Appelle la fonction `onSubmit` avec les valeurs du terme de recherche et du filtre activé.
   */
  const handleSubmit = () => {
    onSubmit(searchTerm, filterEnabled);
  };

  /**
   * Fonction qui sera appelée lorsque l'utilisateur active/désactive le filtre de recherche.
   * Met à jour la variable `filterEnabled` qui sera utilisée lors de la soumission du formulaire.
   */
  const handleFilterToggle = () => {
    setFilterEnabled(!filterEnabled);
  };

  /**
   * Barre de recherche
   */

  return (
    <View style={[styles.Flex]}>
      <View style={styles.Container}>
        <Icon name="search" style={styles.Icon} />
        <TextInput
          style={styles.Input}
          placeholder="Recherche"
          placeholderTextColor="#d9d9d9"
          onChangeText={text => setSearchTerm(text)}
          value={searchTerm}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
      </View>
      <Pressable
        onPress={handleFilterToggle}
        style={styles.FilterIconContainer}>
        <Icon
          name="filter"
          style={[styles.FilterIcon, filterEnabled && styles.FilterIconActive]}
        />
      </Pressable>
    </View>
  );
};

/**
 * Styles
 */

const styles = StyleSheet.create({
  Flex: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    margin: 20,
  },
  Container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '80%',
  },
  Icon: {
    color: '#000',
    fontSize: 20,
    marginRight: 5,
  },
  Input: {
    color: '#000',
    fontSize: 16,
    flex: 1,
  },
  FilterIconContainer: {
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '20%',
  },
  FilterIcon: {
    color: '#555',
    fontSize: 20,
  },
  FilterIconActive: {
    color: '#1E90FF',
  },
});

export default SearchBar;
