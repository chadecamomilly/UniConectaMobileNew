import Esportes from "../models/Esportes"; 
import DaoEsportes from "../models/dao/DaoEsportes"; 
import ModelError from "../models/ModelError"; 

import { ref, update, get } from "firebase/database"; 

export default class EsportesController {
  constructor() {
    this.dao = new DaoEsportes();
  }

  /**
   * Lista todos os esportes ativos (true) do nó /esportes.
   * @returns {object} Objeto de resposta com sucesso/erro e um array de nomes de esportes ativos.
   */
  async listarEsportesAtivos() {
    try {
      const esportesColecao = await this.dao.obterEsportes(); 
      const esportesAtivos = esportesColecao.getEsportesAtivos();

      return this._retornarSucesso("Esportes ativos listados com sucesso.", esportesAtivos);
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em listarEsportesAtivos:", error);
      return this._retornarErro("Erro ao listar esportes ativos.");
    }
  }

  /**
   * Inscreve um usuário em um esporte.
   * Atualiza o array 'esportes' do aluno no Realtime Database.
   * @param {string} nomeEsporte - O nome do esporte para inscrever.
   * @param {string} uid - O UID do usuário/aluno.
   * @returns {object} Objeto de resposta com sucesso/erro.
   */
  async participarEsporte(nomeEsporte, uid) {
    try {
      if (!uid) {
        return this._retornarErro("UID do usuário é obrigatório.");
      }

      if (!Esportes.esportesValidos().includes(nomeEsporte)) {
        return this._retornarErro(`Esporte inválido: ${nomeEsporte}`);
      }

      const db = this.dao.obterConexao();

      const alunoEsportesRef = ref(db, `alunos/${uid}/esportes`);
      const snapshot = await get(alunoEsportesRef); 

      let esportesAtuais = snapshot.exists() ? snapshot.val() : [];

      if (!Array.isArray(esportesAtuais) && esportesAtuais !== null) {
          esportesAtuais = Object.values(esportesAtuais);
      } else if (esportesAtuais === null) {
          esportesAtuais = [];
      }

      if (esportesAtuais.includes(nomeEsporte)) {
        return this._retornarSucesso(`Usuário já inscrito em ${nomeEsporte}.`);
      }

      esportesAtuais.push(nomeEsporte);

      await update(ref(db, `alunos/${uid}`), { esportes: esportesAtuais });

      return this._retornarSucesso(`Usuário inscrito em ${nomeEsporte} com sucesso.`);
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em participarEsporte:", error);
      return this._retornarErro("Erro ao inscrever usuário no esporte.");
    }
  }

  /**
   * Lista os esportes que um usuário específico participa.
   * @param {string} uid - O UID do usuário.
   * @returns {object} Objeto de resposta com sucesso/erro e um array de nomes de esportes do usuário.
   */
  async listarEsportesDoUsuario(uid) {
    try {
      if (!uid) {
        return this._retornarErro("UID do usuário é obrigatório.");
      }

      const db = this.dao.obterConexao();

      const esportesRef = ref(db, `alunos/${uid}/esportes`);
      const snapshot = await get(esportesRef);

      let esportes = snapshot.exists() ? snapshot.val() : [];

      if (!Array.isArray(esportes) && esportes !== null) {
          esportes = Object.values(esportes);
      } else if (esportes === null) {
          esportes = [];
      }

      return this._retornarSucesso("Esportes do usuário listados com sucesso.", esportes);
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em listarEsportesDoUsuario:", error);
      return this._retornarErro("Erro ao listar esportes do usuário.");
    }
  }

  _retornarSucesso(mensagem, dados = null) {
    return { sucesso: true, mensagem, dados };
  }

  _retornarErro(mensagem) {
    return { sucesso: false, mensagem };
  }
}