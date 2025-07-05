import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function FotoPerfil({ photoURL, displayName, size = 100 }) {
    const initials = displayName
        ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';

    return (
        <View style={[
            styles.container,
            { width: size, height: size, borderRadius: size / 2 } 
        ]}>
            {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.image} />
            ) : (
                <Text style={[styles.initialsText, { fontSize: size * 0.4 }]}>{initials}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#666', 
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', 
        borderWidth: 2, 
        borderColor: '#fff', 
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover', 
    },
    initialsText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});