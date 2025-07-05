import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal } from "react-native";
import { useAuth } from "../../contexts/AuthContext"; 
import Header from "../components/Header"; 
import FotoPerfil from "../components/FotoPerfil"; 
import { router } from 'expo-router'; 

function LogoutConfirmationModal({ isVisible, onConfirm, onCancel }) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onCancel} 
        >
            <View style={styles.modalOverlay}>
                <View style={styles.confirmationModalContent}>
                    <Text style={styles.confirmationTitle}>Sair da Conta</Text>
                    <Text style={styles.confirmationMessage}>
                        Tem certeza que deseja sair?
                    </Text>
                    <View style={styles.confirmationButtonContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={onConfirm} 
                        >
                            <Text style={styles.buttonText}>Sair</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default function Perfil() {
    const { user, logout, loading: authLoading, refreshUser } = useAuth();
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    useEffect(() => {
        console.log("[Perfil.js] Usuário carregado:", user?.displayName || user?.email);
        console.log("[Perfil.js] URL da foto:", user?.photoURL);
        console.log("[Perfil.js] Meus Esportes:", user?.meusEsportes);
        console.log("[Perfil.js] Tipo/Perfil:", user?.perfil);
    }, [user]); 

    const handleLogout = () => {
        setShowLogoutConfirmation(true);
    };

    const confirmAndExecuteLogout = async () => {
        try {
            await logout(); 
            setShowLogoutConfirmation(false); 
        } catch (e) {
            console.error("Erro ao realizar logout no Perfil.js:", e);
            Alert.alert("Erro ao Sair", "Não foi possível sair. Tente novamente.");
            setShowLogoutConfirmation(false); 
        }
    };

    if (authLoading || !user) { 
        return (
            <View style={styles.loadingContainer}>
                <Header />
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#092261" />
                    <Text style={styles.loadingText}>Carregando perfil...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.mainContent}>
                <Text style={styles.title}>Perfil</Text>

                <FotoPerfil
                    photoURL={user.photoURL} 
                    displayName={user.displayName || user.nome || user.email} 
                    size={120} 
                />

                <Text style={styles.nameText}>{user.displayName || user.nome || "Usuário"}</Text>
                <Text style={styles.emailText}>{user.email}</Text>
                <Text style={styles.profileType}>Tipo de Usuário: {user.perfil ? user.perfil.charAt(0).toUpperCase() + user.perfil.slice(1) : 'Não Definido'}</Text>

                {user.meusEsportes && user.meusEsportes.length > 0 && (
                    <View style={styles.esportesContainer}>
                        <Text style={styles.esportesTitle}>Meus Esportes:</Text>
                        <View style={styles.esportesList}>
                            {user.meusEsportes.map((esporte, index) => (
                                <View key={index} style={styles.esporteTag}>
                                    <Text style={styles.esporteTagText}>{esporte.charAt(0).toUpperCase() + esporte.slice(1)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}


                <TouchableOpacity
                    onPress={handleLogout} 
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutButtonText}>Sair</Text>
                </TouchableOpacity>
            </View>

            <LogoutConfirmationModal
                isVisible={showLogoutConfirmation}
                onConfirm={confirmAndExecuteLogout} 
                onCancel={() => setShowLogoutConfirmation(false)} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#092261', 
    },
    loadingContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#092261', 
    },
    mainContent: {
        flexGrow: 1, 
        alignItems: 'center', 
        padding: 20, 
    },
    title: {
        fontSize: 28, 
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20, 
    },
    nameText: {
        marginTop: 15,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    emailText: {
        fontSize: 16,
        color: '#ccc', 
        marginBottom: 10, 
    },
    profileType: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 20, 
    },
    esportesContainer: {
        marginTop: 20,
        width: '90%', 
        maxWidth: 400, 
        backgroundColor: '#051640', 
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    esportesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    esportesList: {
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: 8, 
    },
    esporteTag: {
        backgroundColor: '#3498db', 
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    esporteTagText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'capitalize', 
    },
    logoutButton: {
        marginTop: 40, 
        backgroundColor: '#dc3545', 
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmationModalContent: {
        width: '80%',
        maxWidth: 400,
        backgroundColor: '#051640',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    confirmationTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    confirmationMessage: {
        fontSize: 16,
        color: '#ccc',
        marginBottom: 25,
        textAlign: 'center',
    },
    confirmationButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        gap: 10,
    },
    actionButton: { 
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minWidth: 100,
    },
    cancelButton: { 
        backgroundColor: '#777',
    },
    deleteButton: { 
        backgroundColor: '#dc3545',
    },
    buttonText: { 
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});