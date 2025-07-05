import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import EsportesController from "../../src/controllers/EsportesController";
import { useAuth } from '../../contexts/AuthContext';
import Header from "../components/Header";

export default function Configuracoes() {
    const [esportesAtivos, setEsportesAtivos] = useState([]);
    const [meusEsportes, setMeusEsportes] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user, loading: authLoading, refreshUser } = useAuth(); 
    const perfil = user?.perfil;

    const controller = useMemo(() => new EsportesController(), []);

    const carregarDados = useCallback(async () => {
        if (authLoading || !user) {
            return;
        }

        setLoading(true);
        try {
            if (perfil === "aluno" || perfil === "responsavel") {
                const [esportesResponse, meusEsportesResponse] = await Promise.all([
                    controller.listarEsportesAtivos(),
                    controller.listarEsportesDoUsuario(user.uid),
                ]);

                if (esportesResponse.sucesso) {
                    setEsportesAtivos(esportesResponse.dados);
                } else {
                    console.error("Erro ao listar esportes ativos:", esportesResponse.mensagem);
                    Alert.alert("Erro", esportesResponse.mensagem);
                }

                if (meusEsportesResponse.sucesso) {
                    setMeusEsportes(meusEsportesResponse.dados);
                } else {
                    console.error("Erro ao listar esportes do usuário:", meusEsportesResponse.mensagem);
                    Alert.alert("Erro", meusEsportesResponse.mensagem);
                }
            }
        } catch (error) {
            console.error("Erro inesperado ao carregar dados de esportes:", error);
            Alert.alert("Erro", "Não foi possível carregar os dados de esportes.");
        } finally {
            setLoading(false);
        }
    }, [authLoading, user, perfil, controller]); 

    useEffect(() => {
        carregarDados();
    }, [carregarDados]); 

    async function handleParticipar(nomeEsporte) {
        if (!user) {
            Alert.alert("Erro", "Usuário não autenticado.");
            return;
        }

        try {
            if (meusEsportes.includes(nomeEsporte)) {
                Alert.alert("Aviso", `Você já participa de ${nomeEsporte}.`);
                return;
            }

            const response = await controller.participarEsporte(nomeEsporte, user.uid);
            if (response.sucesso) {
                setMeusEsportes((prev) => [...prev, nomeEsporte]);
                Alert.alert("Sucesso", `Você agora participa de ${nomeEsporte}!`);
            } else {
                Alert.alert("Erro", response.mensagem);
            }
        } catch (err) {
            console.error("Erro ao participar do esporte:", err);
            Alert.alert("Erro", "Não foi possível participar do esporte: " + err.message);
        }
    }

    async function handleSair(nomeEsporte) {
        if (!user) {
            Alert.alert("Erro", "Usuário não autenticado.");
            return;
        }

        try {
            const response = await controller.sairEsporte(nomeEsporte, user.uid);
            if (response.sucesso) {
                setMeusEsportes((prev) => prev.filter(e => e !== nomeEsporte));
                Alert.alert("Sucesso", `Você saiu de ${nomeEsporte}.`);
            } else {
                Alert.alert("Erro", response.mensagem);
            }
        } catch (err) {
            console.error("Erro ao sair do esporte:", err);
            Alert.alert("Erro", "Não foi possível sair do esporte: " + err.message);
        }
    }


    if (authLoading || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#092261" />
                <Text style={styles.loadingText}>Carregando configurações de esportes...</Text>
            </View>
        );
    }

    if (perfil !== "aluno" && perfil !== "responsavel") {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>Apenas alunos ou responsáveis podem configurar esportes.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Esportes</Text>
                <View style={styles.listContainer}>
                    {esportesAtivos.length === 0 ? (
                        <Text style={styles.noEsportesText}>Nenhum esporte ativo disponível.</Text>
                    ) : (
                        esportesAtivos.map((esporte) => (
                            <View key={esporte} style={styles.esporteItem}>
                                <Text style={styles.esporteName}>{esporte.charAt(0).toUpperCase() + esporte.slice(1)}</Text>
                                {meusEsportes.includes(esporte) ? (
                                    <TouchableOpacity
                                        style={styles.participandoButton}
                                        onPress={() => handleSair(esporte)} 
                                    >
                                        <Text style={styles.participandoButtonText}>Participando</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.participarButton}
                                        onPress={() => handleParticipar(esporte)}
                                    >
                                        <Text style={styles.participarButtonText}>Participar</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#092261',
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
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    messageText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    listContainer: {
        backgroundColor: '#051640',
        borderRadius: 12,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    noEsportesText: {
        color: '#ccc',
        textAlign: 'center',
        paddingVertical: 20,
        fontSize: 16,
    },
    esporteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1a3a6b',
    },
    esporteName: {
        fontSize: 18,
        color: '#fff',
        textTransform: 'capitalize',
    },
    participarButton: {
        backgroundColor: '#3498db',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    participarButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    participandoButton: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    participandoButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});