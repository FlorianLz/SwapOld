import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function Menu({isConnected}: {isConnected: boolean}) {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Home</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Messagerie</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Hub</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Favoris</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Profil</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
  },
  body: {
    flex: 3,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
