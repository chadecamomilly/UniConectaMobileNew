import React from 'react';
import { Pressable, StyleSheet } from 'react-native'; 
import { Link, Tabs } from 'expo-router'; 

import FontAwesome from '@expo/vector-icons/FontAwesome';


function TabBarIcon(props) { 
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = 'light'; 
  const activeTintColor = Colors[colorScheme].tint; 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        headerShown: false, 
      }}>

      <Tabs.Screen
        name="home" 
        options={{
          title: 'Home', 
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="publicacoes" 
        options={{
          title: 'Publicações',
          tabBarIcon: ({ color }) => <TabBarIcon name="newspaper-o" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

    </Tabs>
  );
}

