import { getDatabase, ref, get, set, update, remove } from "firebase/database";
import app from "../../../config/firebase"; 

import Esportes from "../Esportes"; 
import ModelError from "../ModelError"; 

export default class DaoEsportes {
  db = null;

  constructor() {
    this.db = getDatabase(app);
  }

  /**
   * Obtém a instância da conexão com o Realtime Database.
   * Não é mais assíncrono, pois a conexão é obtida no construtor.
   * @returns {any} A instância do database.
   * @throws {ModelError} Se a instância do database não foi inicializada.
   */
  obterConexao() {
    if (!this.db) {
      throw new ModelError("A instância do Firebase Realtime Database não foi inicializada.");
    }
    return this.db;
  }

  /**
   * Obtém a coleção completa de esportes do Realtime Database.
   * Assume que os dados de todos os esportes estão sob um único nó "esportes/".
   * @returns {Promise<Esportes>} Uma promessa que resolve para um objeto Esportes (com 's').
   * @throws {ModelError} Se não houver dados de esportes no banco.
   */
  async obterEsportes() {
    const databaseInstance = this.obterConexao(); 
    const dbRef = ref(databaseInstance, "esportes/"); 
    const snapshot = await get(dbRef); 

    if (!snapshot.exists()) {
      throw new ModelError("Não há dados de esportes no banco.");
    }

    const dados = snapshot.val();
    return new Esportes(dados); 
  }

  /**
   * Insere (sobrescreve) a coleção completa de esportes no Realtime Database.
   * @param {Esportes} esportesInstancia - Uma instância da classe Esportes contendo os dados a serem salvos.
   * @throws {ModelError} Se o objeto fornecido não for uma instância de Esportes.
   */
  async inserir(esportesInstancia) {
    if (!(esportesInstancia instanceof Esportes)) {
      throw new ModelError(
        "Objeto inválido, esperado uma instância da classe Esportes."
      );
    }

    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, "esportes/"); // Referência ao nó raiz de esportes

    await set(dbRef, esportesInstancia.toObject());
  }

  /**
   * Altera (atualiza) a coleção completa de esportes no Realtime Database.
   * @param {Esportes} esportesInstancia - Uma instância da classe Esportes contendo os dados a serem atualizados.
   * @throws {ModelError} Se o objeto fornecido não for uma instância de Esportes.
   */
  async alterar(esportesInstancia) {
    if (!(esportesInstancia instanceof Esportes)) {
      throw new ModelError(
        "Objeto inválido, esperado uma instância da classe Esportes."
      );
    }

    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, "esportes/");

    await update(dbRef, esportesInstancia.toObject());
  }

  /**
   * Remove a coleção completa de esportes do Realtime Database.
   * @throws {ModelError} Se a operação de remoção falhar.
   */
  async remover() {
    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, "esportes/");
    await remove(dbRef);
  }
}