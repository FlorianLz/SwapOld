import React, {useState, useEffect} from 'react';
import {supabase} from '../lib/initSupabase';
import {StyleSheet, View, Alert, Text, TextInput} from 'react-native';
import {Button} from 'react-native-elements';
import {Session} from '@supabase/supabase-js';

export default function Account({
  session,
  route,
}: {session: Session; params: {session: Session}} | any) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  async function getProfile() {
    console.log('getProfile');
    try {
      setLoading(true);
      if (!session?.user) {
        throw new Error('No user on the session!');
      }

      let {data, error, status} = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name')
        .eq('id', session?.user.id)
        .single();
      console.log('data', data);
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) {
        throw new Error('No user on the session!');
      }

      const updates = {
        username: username,
        updated_at: new Date(),
      };

      console.log('updates', updates);

      const {data} = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session?.user.id)
        .select();

      console.log(data);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.Title}>Email</Text>
      <TextInput style={styles.input} value={session?.user?.email} disabled />
      <Text style={styles.Title}>Username</Text>
      <TextInput
        style={styles.input}
        value={username || ''}
        onChangeText={text => setUsername(text)}
      />
      <Button
        title={loading ? 'Loading ...' : 'Update'}
        onPress={() => updateProfile()}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  Title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  container: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
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
    marginBottom: 12,
  },
});
