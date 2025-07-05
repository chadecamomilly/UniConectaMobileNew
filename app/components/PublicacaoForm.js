import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Modal, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; 

const esportesValidos = [
    "basquete", "cheerleading", "futsal", "geral", "handebol", "natacao", "volei",
];

function CustomTextInput({ label, value, onChangeText, placeholder, multiline, numberOfLines, autoFocus, keyboardType, disabled }) {
    return (
        <View style={formStyles.inputGroup}>
            <Text style={formStyles.label}>{label}</Text>
            <TextInput
                style={[formStyles.input, multiline && formStyles.textArea]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#888"
                multiline={multiline}
                numberOfLines={numberOfLines}
                autoFocus={autoFocus}
                keyboardType={keyboardType}
                editable={!disabled}
                selectTextOnFocus={!disabled}
            />
        </View>
    );
}

function DeleteConfirmationModal({ isVisible, onConfirm, onCancel, isDeleting }) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onCancel} 
        >
            <View style={formStyles.modalOverlay}>
                <View style={formStyles.confirmationModalContent}>
                    <Text style={formStyles.confirmationTitle}>Confirmar Exclusão</Text>
                    <Text style={formStyles.confirmationMessage}>
                        Tem certeza que deseja excluir esta publicação? Esta ação é irreversível.
                    </Text>
                    <View style={formStyles.confirmationButtonContainer}>
                        <TouchableOpacity
                            style={[formStyles.actionButton, formStyles.cancelButton]}
                            onPress={onCancel}
                            disabled={isDeleting}
                        >
                            <Text style={formStyles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[formStyles.actionButton, formStyles.deleteButton]}
                            onPress={onConfirm} 
                            disabled={isDeleting}
                        >
                            {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={formStyles.buttonText}>Excluir</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}


export default function PublicacaoForm({
    modo = "criar",
    initialData,
    onSalvar,
    onCancelar,
    onExcluir,
}) {
    const [titulo, setTitulo] = useState("");
    const [conteudo, setConteudo] = useState("");
    const [autor, setAutor] = useState("");
    const [esportesSelecionados, setEsportesSelecionados] = useState([]);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); 

    const { user } = useAuth();

    useEffect(() => {
        if (modo === "editar" && initialData) {
            setTitulo(initialData.titulo || "");
            setConteudo(initialData.conteudo || "");
            setAutor(initialData.autor || "");
            setEsportesSelecionados(initialData.esportes || []);
        } else {
            setTitulo("");
            setConteudo("");
            setEsportesSelecionados([]);
            setAutor(user?.displayName || user?.email || "");
        }
        setError("");
        setIsSaving(false);
        setIsDeleting(false); 
        setShowDeleteConfirmation(false); 
    }, [modo, initialData, user]);

    function toggleEsporte(esporte) {
        setEsportesSelecionados((prev) =>
            prev.includes(esporte)
                ? prev.filter((e) => e !== esporte)
                : [...prev, esporte]
        );
    }

    function validar() {
        if (!titulo.trim()) {
            setError("Título é obrigatório.");
            return false;
        }
        if (!conteudo.trim()) {
            setError("Conteúdo é obrigatório.");
            return false;
        }
        if (!autor.trim()) {
            setError("Autor é obrigatório.");
            return false;
        }
        if (esportesSelecionados.length === 0) {
            setError("Selecione pelo menos um esporte.");
            return false;
        }
        setError("");
        return true;
    }

    const handleSalvar = async () => {
        if (!validar()) return;
        setIsSaving(true);
        try {
            const dataToSave = {
                titulo: titulo.trim(),
                conteudo: conteudo.trim(),
                autor: autor.trim(),
                esportes: esportesSelecionados,
            };

            if (modo === "editar") {
                await onSalvar({ uid: initialData.uid, ...dataToSave });
            } else {
                await onSalvar(dataToSave);
            }
        } catch (e) {
            console.error("Erro ao salvar no formulário:", e);
            setError("Não foi possível salvar a publicação. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        console.log('[PublicacaoForm] handleConfirmDelete CHAMADO!'); 

        if (typeof onExcluir !== 'function') {
            console.error('[PublicacaoForm] Erro: A prop onExcluir não é uma função ou não foi fornecida!');
            setError("Ação de exclusão não configurada corretamente.");
            setShowDeleteConfirmation(false); 
            return;
        }

        if (!initialData || !initialData.uid) {
            console.error('[PublicacaoForm] Erro: initialData ou UID não definidos para exclusão!');
            setError("Não foi possível identificar a publicação para exclusão.");
            setShowDeleteConfirmation(false); 
            return;
        }

        setIsDeleting(true); 
        try {
            console.log('[PublicacaoForm] Chamando onExcluir com UID:', initialData.uid); 
            await onExcluir(initialData.uid);
        } catch (error) {
            console.error('[PublicacaoForm] Erro ao chamar onExcluir:', error);
            setError("Não foi possível excluir a publicação. Tente novamente.");
        } finally {
            setIsDeleting(false); 
            setShowDeleteConfirmation(false); 
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={true} 
            onRequestClose={onCancelar}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={formStyles.modalOverlay}
            >
                <ScrollView contentContainerStyle={formStyles.scrollViewContent}>
                    <View style={formStyles.modalContent}>
                        <Text style={formStyles.title}>
                            {modo === "editar" ? "Editar Publicação" : "Nova Publicação"}
                        </Text>

                        {error ? (
                            <View style={formStyles.errorMessageContainer}>
                                <Text style={formStyles.errorMessage}>{error}</Text>
                            </View>
                        ) : null}

                        <CustomTextInput
                            label="Título"
                            value={titulo}
                            onChangeText={setTitulo}
                            placeholder="Título da publicação"
                            autoFocus
                        />

                        <CustomTextInput
                            label="Conteúdo"
                            value={conteudo}
                            onChangeText={setConteudo}
                            placeholder="Escreva o conteúdo da publicação aqui..."
                            multiline
                            numberOfLines={4}
                        />

                        <CustomTextInput
                            label="Autor"
                            value={autor}
                            onChangeText={setAutor}
                            placeholder="Nome do autor"
                            disabled={modo !== "criar"}
                        />

                        <View style={formStyles.fieldset}>
                            <Text style={formStyles.legend}>Esportes</Text>
                            <View style={formStyles.tagSelectionContainer}>
                                {esportesValidos.map((esporte) => (
                                    <TouchableOpacity
                                        key={esporte}
                                        style={[
                                            formStyles.tagOption,
                                            esportesSelecionados.includes(esporte) && formStyles.tagOptionSelected
                                        ]}
                                        onPress={() => toggleEsporte(esporte)}
                                    >
                                        <Text style={[
                                            formStyles.tagOptionText,
                                            esportesSelecionados.includes(esporte) && formStyles.tagOptionTextSelected
                                        ]}>
                                            {esporte.charAt(0).toUpperCase() + esporte.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={formStyles.buttonContainer}>
                            {modo === "editar" && (
                                <TouchableOpacity
                                    style={[formStyles.actionButton, formStyles.deleteButton]}
                                    onPress={() => setShowDeleteConfirmation(true)} 
                                    disabled={isSaving || isDeleting}
                                >
                                    {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={formStyles.buttonText}>Excluir</Text>}
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[formStyles.actionButton, formStyles.cancelButton]}
                                onPress={onCancelar}
                                disabled={isSaving || isDeleting}
                            >
                                <Text style={formStyles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[formStyles.actionButton, formStyles.saveButton]}
                                onPress={handleSalvar}
                                disabled={isSaving || isDeleting}
                            >
                                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={formStyles.buttonText}>{modo === "editar" ? "Atualizar" : "Publicar"}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <DeleteConfirmationModal
                isVisible={showDeleteConfirmation}
                onConfirm={handleConfirmDelete} 
                onCancel={() => setShowDeleteConfirmation(false)} 
                isDeleting={isDeleting} 
            />
        </Modal>
    );
}

const formStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    modalContent: {
        width: '90%',
        maxWidth: 600,
        backgroundColor: '#051640',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    errorMessageContainer: {
        backgroundColor: '#ff6347',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        alignItems: 'center',
    },
    errorMessage: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#333',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    fieldset: {
        marginBottom: 15,
    },
    legend: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    tagSelectionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagOption: {
        backgroundColor: '#666',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#888',
    },
    tagOptionSelected: {
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
    },
    tagOptionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    tagOptionTextSelected: {
        color: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        flexWrap: 'wrap',
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
    saveButton: {
        backgroundColor: '#3498db',
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
});