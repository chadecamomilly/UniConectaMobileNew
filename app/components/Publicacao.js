import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import moment from 'moment'; 

export default function Publicacao({ uid, dataCriacao, titulo, conteudo, autor, esportes }) {
    const formattedDate = moment(dataCriacao).format('DD/MM/YYYY HH:mm');

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{titulo}</Text>
            <Text style={styles.content}>{conteudo}</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.author}>Por: {autor}</Text>
                <Text style={styles.date}>{formattedDate}</Text>
            </View>

            {esportes && esportes.length > 0 && (
                <View style={styles.tagsContainer}>
                    <Text style={styles.tagsLabel}>Esportes:</Text>
                    <View style={styles.tagList}>
                        {esportes.map((esporte, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{esporte.charAt(0).toUpperCase() + esporte.slice(1)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#051640', 
        borderRadius: 8,
        padding: 16,
        marginBottom: 16, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    content: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 12,
        lineHeight: 20, 
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    author: {
        fontSize: 12,
        color: '#aaa',
        fontStyle: 'italic',
    },
    date: {
        fontSize: 12,
        color: '#aaa',
    },
    tagsContainer: {
        marginTop: 8,
    },
    tagsLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, 
    },
    tag: {
        backgroundColor: '#3498db', 
        borderRadius: 15,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    tagText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
});