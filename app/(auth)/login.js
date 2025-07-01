import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";

import AuthController from "../../src/controllers/AuthController"; 
import ModelError from "../../src/models/ModelError"; 

import logo from "../../assets/images/logoUniConecta.png"; 

const authController = new AuthController();

export default function LoginScreen() { 
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const router = useRouter();

  // Função auxiliar para limpar mensagens
  const clearMessages = () => {
    setErro("");
    setMensagemSucesso("");
  };

  const handleLogin = async () => {
    clearMessages(); // Limpa mensagens anteriores

    // Validações básicas antes de chamar o controller
    if (!email.trim() || !senha.trim()) {
      setErro("Email e senha são obrigatórios.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true); // Inicia o loading

    try {
      // Chama o método do AuthController para login
      const result = await authController.loginComEmailSenha(email, senha);

      if (result.sucesso) {
        setMensagemSucesso(result.mensagem); // Define mensagem de sucesso
        // Limpar formulário
        setEmail("");
        setSenha("");

        // Redirecionar para a tela principal do aplicativo (ex: home na pasta (tabs))
        setTimeout(() => {
          router.replace("/home"); // Use o nome da sua rota principal após o login (ex: app/(tabs)/home.js)
        }, 2000);
      } else {
        setErro(result.mensagem); // Define mensagem de erro
      }
    } catch (error) {
      console.error("Erro inesperado em LoginScreen:", error);
      if (error instanceof ModelError) {
        setErro(error.message);
      } else {
        setErro("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false); // Finaliza o loading
    }
  };

  const handleForgotPassword = () => {
    // Implementar navegação para tela de redefinição de senha
    // router.push("/ForgotPasswordScreen"); // Crie esta rota no futuro
    Alert.alert("Redefinir Senha", "Funcionalidade de redefinição de senha será implementada em breve.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />

          <View style={styles.formContainer}>
            <Text style={styles.title}>Fazer Login</Text>

            {/* Exibição das mensagens de erro/sucesso na tela */}
            {erro ? (
              <Text style={styles.errorMessage}>{erro}</Text>
            ) : null}
            {mensagemSucesso ? (
              <Text style={styles.successMessage}>{mensagemSucesso}</Text>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="nome@exemplo.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearMessages();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha *</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  clearMessages();
                }}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <Text style={styles.registerLinkText}>
              Não tem uma conta?{" "}
              <Link href="/cadastro" style={styles.registerLink}>
                Cadastre-se
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#092261', // Ajuste para sua cor uniblue
    paddingVertical: 20,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 192,
    height: 192,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#051640', // Ajuste para sua cor uniblue-light
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 24,
  },
  errorMessage: {
    color: '#ff6347', // Um tom de vermelho/laranja para erros (Tomato)
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  successMessage: {
    color: '#32cd32', // Um tom de verde para sucesso (LimeGreen)
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#333',
  },
  button: {
    width: '100%',
    marginTop: 24,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  forgotPasswordLink: {
    marginTop: 10,
    alignSelf: 'center',
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  registerLinkText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
  },
  registerLink: {
    fontWeight: 'bold',
    color: '#fff',
    textDecorationLine: 'underline',
  },
});