import { auth, db } from "../../config/firebase"; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile, 
  signOut, 
} from "firebase/auth"; 
import { ref, set, get } from "firebase/database"; 

import ModelError from "../models/ModelError"; 
import Usuario from "../models/Usuario";

async function _salvarDadosUsuario(userUid, nome, email, perfil = "aluno", foto = "") {
  try {
    const novoUsuarioModel = new Usuario(userUid, nome, email, perfil, []);

    await set(ref(db, `usuarios/${userUid}`), novoUsuarioModel.toObject());

    await set(ref(db, `alunos/${userUid}`), {
      nome: novoUsuarioModel.getNome(),
      foto: foto,
      esportes: [],
    });
  } catch (error) {
    console.error("Erro ao salvar dados do usuário no Realtime Database:", error);
    throw new ModelError("Erro ao salvar informações do usuário no banco de dados.");
  }
}

export default class AuthController {
  /**
   * Realiza o login de um usuário com email e senha.
   * @param {string} email - O email do usuário.
   * @param {string} senha - A senha do usuário.
   * @returns {object} Objeto de resposta com sucesso/erro e o objeto User do Firebase.
   */
  async loginComEmailSenha(email, senha) {
    try {
      if (!email || !senha) {
        return this._retornarErro("Email e senha são obrigatórios.");
      }

      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const user = cred.user;

      if (!user.emailVerified) {
        return this._retornarErro("Email não verificado. Por favor, verifique seu email.");
      }

      return this._retornarSucesso("Login realizado com sucesso.", user);
    } catch (error) {
      console.error("Erro no loginComEmailSenha:", error.code, error.message);
      return this._retornarErro(this._traduzirErroAuth(error.code));
    }
  }

  /**
   * Cadastra um novo usuário com email e senha.
   * @param {string} email - O email para cadastro.
   * @param {string} senha - A senha para cadastro.
   * @param {string} nome - O nome do usuário.
   * @returns {object} Objeto de resposta com sucesso/erro e o objeto User do Firebase.
   */
  async cadastrarComEmailSenha(email, senha, nome) {
    try {
      if (!email || !senha || !nome) {
        return this._retornarErro("Todos os campos (email, senha, nome) são obrigatórios.");
      }

      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const user = cred.user;

      await updateProfile(user, { displayName: nome });

      await sendEmailVerification(user);

      await _salvarDadosUsuario(user.uid, nome, email, "aluno");

      return this._retornarSucesso("Cadastro realizado com sucesso. Verifique seu email para verificar sua conta.", user);
    } catch (error) {
      console.error("Erro em cadastrarComEmailSenha:", error.code, error.message);
      return this._retornarErro(this._traduzirErroAuth(error.code));
    }
  }

  /**
   * Envia um email de redefinição de senha para o email fornecido.
   * @param {string} email - O email do usuário.
   * @returns {object} Objeto de resposta com sucesso/erro.
   */
  async enviarEmailRedefinicaoSenha(email) {
    try {
      if (!email) {
        return this._retornarErro("Email é obrigatório para redefinição de senha.");
      }
      await sendPasswordResetEmail(auth, email);
      return this._retornarSucesso("Email de redefinição de senha enviado. Verifique sua caixa de entrada.");
    } catch (error) {
      console.error("Erro em enviarEmailRedefinicaoSenha:", error.code, error.message);
      return this._retornarErro(this._traduzirErroAuth(error.code));
    }
  }

  /**
   * Realiza o logout do usuário atual.
   * @returns {object} Objeto de resposta com sucesso/erro.
   */
  async logout() {
    try {
      await signOut(auth);
      return this._retornarSucesso("Logout realizado com sucesso.");
    } catch (error) {
      console.error("Erro em logout:", error.code, error.message);
      return this._retornarErro(this._traduzirErroAuth(error.code));
    }
  }

  _retornarSucesso(mensagem, dados = null) {
    return { sucesso: true, mensagem, dados };
  }

  _retornarErro(mensagem) {
    return { sucesso: false, mensagem };
  }

  _traduzirErroAuth(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'O email fornecido já está em uso por outra conta.';
      case 'auth/invalid-email':
        return 'O formato do email é inválido.';
      case 'auth/operation-not-allowed':
        return 'Operação não permitida. Verifique suas configurações de autenticação no Firebase.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/user-disabled':
        return 'O usuário foi desabilitado.';
      case 'auth/user-not-found':
        return 'Nenhum usuário encontrado com este email.';
      case 'auth/wrong-password':
        return 'Senha incorreta.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas de login/cadastro. Tente novamente mais tarde.';
      case 'auth/requires-recent-login':
        return 'Esta operação requer autenticação recente. Faça login novamente.';
      default:
        return 'Ocorreu um erro de autenticação inesperado. Tente novamente.';
    }
  }
}