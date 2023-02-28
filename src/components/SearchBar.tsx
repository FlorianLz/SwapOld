import React, {useState} from 'react';
import {TextInput, StyleSheet, View, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  onSubmit: (searchTerm: string, filterEnabled: boolean) => void;
}

const SearchBar: React.FC<Props> = ({onSubmit}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState(false);

  const handleSubmit = () => {
    onSubmit(searchTerm, filterEnabled);
  };

  const handleFilterToggle = () => {
    setFilterEnabled(!filterEnabled);
  };

  return (
    <View style={[styles.Flex, styles.Shadow]}>
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

const styles = StyleSheet.create({
  Flex: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    margin: 20,
  },
  Shadow: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    marginBottom: 10,
    zIndex: 999,
  },
  Container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 20,
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
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
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
