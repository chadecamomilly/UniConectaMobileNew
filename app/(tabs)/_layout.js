import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#3498db', 
    tabIconDefault: '#ccc', 
    tabIconSelected: '#fff', 
    tabBackground: '#051640', 
  },
};

export default function TabLayout() {
  const colorScheme = 'light'; 
  const activeTintColor = Colors[colorScheme].tint; 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].tabBackground, 
          borderTopWidth: 0,
          elevation: 5, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          height: 60, 
          paddingBottom: 5, 
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          marginBottom: 5, 
        },
      }}
    >
      <Tabs.Screen
        name="Home" 
        options={{
          title: 'Início', 
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="Configuracoes" 
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />, 
        }}
      />

      <Tabs.Screen
        name="Perfil" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user-circle" color={color} />,
          href: null, 
        }}
      />
    </Tabs>
  );
}