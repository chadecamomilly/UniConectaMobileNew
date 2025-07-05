import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Header from '../components/Header';
import Publicacao from '../components/Publicacao';
import PublicacaoForm from '../components/PublicacaoForm';
import PublicacaoController from '../../src/controllers/PublicacaoController'; 
import { useAuth } from '../../contexts/AuthContext';

export default function Home() {
    const [publicacoes, setPublicacoes] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false); 
    const [publicacaoEditando, setPublicacaoEditando] = useState(null); 
    const [loadingPublicacoes, setLoadingPublicacoes] = useState(true); 
    const [refreshing, setRefreshing] = useState(false); 

    const controller = useMemo(() => new PublicacaoController(), []);
    const { user, loading: authLoading } = useAuth();
    const perfil = user?.perfil;
    const meusEsportes = user?.meusEsportes || [];

const carregarPublicacoes = useCallback(async () => {
        setLoadingPublicacoes(true);
        setRefreshing(true);

        try {
            const response = await controller.listarTodasPublicacoes(); 
            if (response.sucesso && Array.isArray(response.dados)) {
                let publicacoesFiltradas = response.dados;

                if (perfil === "aluno") {
                    console.log("[Home.js] Aluno logado. Filtrando publicações por esportes:", meusEsportes);
                    publicacoesFiltradas = response.dados.filter(pub => {
                        if (!pub.esportes || pub.esportes.length === 0) {
                            return false; 
                        }
                        return pub.esportes.some(pubEsporte => meusEsportes.includes(pubEsporte));
                    });
                } else if (perfil === "responsavel") {
                    console.log("[Home.js] Responsável logado. Vendo todas as publicações.");
                } else {
                    console.log("[Home.js] Perfil não reconhecido ou visitante. Vendo todas as publicações.");
                }

                setPublicacoes(publicacoesFiltradas);
            } else {
                console.error("Erro do Controller ao carregar publicações:", response.mensagem);
                setPublicacoes([]);
                Alert.alert("Erro", response.mensagem);
            }
        } catch (error) {
            console.error("Erro inesperado ao carregar publicações:", error);
            setPublicacoes([]);
            Alert.alert("Erro", "Não foi possível carregar as publicações. Tente novamente.");
        } finally {
            setLoadingPublicacoes(false);
            setRefreshing(false);
        }
    }, [controller, perfil, meusEsportes]); 

    useEffect(() => {
        if (!authLoading && user) { 
            carregarPublicacoes();
        }
    }, [authLoading, user, carregarPublicacoes]);

    async function handleSalvar(novaPublicacao) {
        try {
            const response = await controller.criarPublicacao(novaPublicacao);
            if (response.sucesso) {
                await carregarPublicacoes(); 
                setMostrarForm(false); 
            } else {
                Alert.alert("Erro ao Criar", response.mensagem);
            }
        } catch (error) {
            console.error("Erro inesperado ao salvar publicação:", error);
            Alert.alert("Erro", "Não foi possível criar a publicação. Tente novamente.");
        }
    }

    function abrirEditar(pub) {
        setPublicacaoEditando(pub);
    }

    async function handleSalvarEdicao(publicacaoEditada) {
        try {
            const response = await controller.editarPublicacao(publicacaoEditada.uid, publicacaoEditada);
            if (response.sucesso) {
                await carregarPublicacoes(); 
                setPublicacaoEditando(null); 
            } else {
                Alert.alert("Erro ao Editar", response.mensagem);
            }
        } catch (error) {
            console.error("Erro inesperado ao salvar edição:", error);
            Alert.alert("Erro", "Não foi possível atualizar a publicação. Tente novamente.");
        }
    }

    async function handleExcluir(uid) {
        try {
            const response = await controller.excluirPublicacao(uid);
            if (response.sucesso) {
                await carregarPublicacoes(); 
                setPublicacaoEditando(null); 
            } else {
                Alert.alert("Erro ao Excluir", response.mensagem);
            }
        } catch (error) {
            console.error("Erro inesperado ao excluir publicação:", error);
            Alert.alert("Erro", "Não foi possível excluir a publicação. Tente novamente.");
        }
    }

    const handleCancelarForm = useCallback(() => {
        setMostrarForm(false);
        setPublicacaoEditando(null);
    }, []);

    if (authLoading) {
        return (
            <View style={styles.fullscreenLoading}>
                <ActivityIndicator size="large" color="#092261" />
                <Text style={styles.loadingText}>Carregando informações do usuário...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.headerContent}>
                <Text style={styles.title}>Publicações</Text>
                {perfil === "responsavel" && (
                    <TouchableOpacity
                        style={styles.newPublicationButton}
                        onPress={() => setMostrarForm(true)}
                    >
                        <Text style={styles.newPublicationButtonText}>+ Nova publicação</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loadingPublicacoes && !refreshing ? (
                <View style={styles.loadingPublicacoesContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingPublicacoesText}>Carregando publicações...</Text>
                </View>
            ) : Array.isArray(publicacoes) && publicacoes.length === 0 ? (
                <View style={styles.noPublicationsContainer}>
                    <Text style={styles.noPublicationsText}>
                        {perfil === "aluno" ? "Nenhuma publicação encontrada para seus esportes." : "Ainda não há publicações para mostrar."}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.publicacoesListContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={carregarPublicacoes}
                            tintColor="#fff"
                            colors={['#fff']}
                        />
                    }
                >
                    {Array.isArray(publicacoes) && publicacoes.map((pub) => (
                        <View key={pub.uid} style={styles.publicationWrapper}>
                            <Publicacao
                                uid={pub.uid}
                                titulo={pub.titulo}
                                conteudo={pub.conteudo}
                                autor={pub.autor}
                                dataCriacao={pub.dataCriacao}
                                esportes={pub.esportes}
                            />
                            {perfil === "responsavel" && (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => abrirEditar(pub)}
                                >
                                    <Text style={styles.editButtonText}>Editar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            {mostrarForm && (
                <PublicacaoForm
                    modo="criar"
                    onSalvar={handleSalvar}
                    onCancelar={handleCancelarForm}
                    esportesPermitidos={perfil === "responsavel" ? meusEsportes : []}
                />
            )}

            {publicacaoEditando && (
                <PublicacaoForm
                    modo="editar"
                    initialData={publicacaoEditando}
                    onSalvar={handleSalvarEdicao}
                    onCancelar={handleCancelarForm}
                    onExcluir={handleExcluir}
                    esportesPermitidos={perfil === "responsavel" ? meusEsportes : []}
                />
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    fullscreenLoading: {
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
    headerContent: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#051640',
        borderBottomWidth: 1,
        borderBottomColor: '#1a3a6b',
    },
    title: {
        fontSize: 24, 
        fontWeight: 'bold',
        color: '#fff', 
    },
    newPublicationButton: {
        backgroundColor: '#3498db', 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        borderRadius: 8,
        alignItems: 'center', 
        justifyContent: 'center',
    },
    newPublicationButtonText: {
        color: '#fff', 
        fontWeight: 'bold',
        fontSize: 14, 
    },
    loadingPublicacoesContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20, 
    },
    loadingPublicacoesText: {
        color: '#fff', 
        marginTop: 10, 
        fontSize: 16, 
    },
    noPublicationsContainer: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, 
        backgroundColor: '#051640', 
        margin: 16, 
        borderRadius: 8, 
        minHeight: 150, 
    },
    noPublicationsText: {
        color: '#ccc', 
        fontSize: 16,
        textAlign: 'center', 
    },
    publicacoesListContent: {
        padding: 16, 
        paddingBottom: 20, 
    },
    publicationWrapper: {
        position: 'relative', 
        marginBottom: 16,
    },
    editButton: {
        position: 'absolute', 
        top: 8,
        right: 8, 
        backgroundColor: '#777', 
        paddingVertical: 4, 
        paddingHorizontal: 8, 
        borderRadius: 4, 
        zIndex: 1, 
    },
    editButtonText: {
        color: '#fff', 
        fontSize: 12, 
    },
});