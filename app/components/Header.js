import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons'; 
import logo from '../../assets/images/logoUniConecta.png'; 

export default function Cabecalho() {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.navigate('/')} style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
      </TouchableOpacity>

      <View style={styles.iconButtonsContainer}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/Perfil')} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12, 
    backgroundColor: '#051640', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  logoContainer: {
    paddingVertical: 4,
  },
  logo: {
    width: 120, 
    height: 40, 
    resizeMode: 'contain', 
  },
  iconButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, 
  },
  iconButton: {
    padding: 4, 
  },
});