import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <Image source={require('../../assets/Scratch_logo.png')} style={styles.logo} />
      <TouchableOpacity>
        <Text style={styles.signIn}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF', // Blue header color
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  signIn: {
    fontSize: 16,
    color: '#fff',
  },
});