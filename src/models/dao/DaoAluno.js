import { getDatabase, ref, get, set, update, remove } from "firebase/database";
import app from "../../../config/firebase"; 

import Aluno from "../Aluno"; 
import ModelError from "../ModelError"; 

export default class DaoAluno {
  constructor() {
    this.db = getDatabase(app); 
  }

  obterConexao() {
    if (!this.db) {
      throw new ModelError("Database não inicializado.");
    }
    return this.db;
  }

  /**
   * Obtém um aluno do Realtime Database pelo seu UID (que é a chave do nó).
   * @param {string} uid - O ID (UID) do aluno.
   * @returns {Promise<Aluno>} - Uma promessa que resolve para um objeto Aluno.
   * @throws {ModelError} Se o UID for inválido ou o aluno não for encontrado.
   */
  async obterAlunoPorUid(uid) {
    if (!uid) {
      throw new ModelError("UID do Aluno inválido.");
    }

    // MUDANÇA: Usar this.db e as funções ref() e get()
    const databaseInstance = this.obterConexao(); // Obtém a instância do database
    const dbRef = ref(databaseInstance, `alunos/${uid}`); // Cria uma referência
    const snapshot = await get(dbRef); // Usa get() na referência

    if (!snapshot.exists()) {
      throw new ModelError(`Aluno com UID ${uid} não encontrado.`);
    }

    const dados = snapshot.val();
    return new Aluno(uid, dados.nome, dados.esportes || [], dados.foto || "");
  }

  /**
   * Obtém todos os alunos do Realtime Database.
   * @returns {Promise<Aluno[]>} - Uma promessa que resolve para um array de objetos Aluno.
   */
  async obterAlunos() {
    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, "alunos/"); 
    const snapshot = await get(dbRef); 

    const lista = [];
    if (snapshot.exists()) {
      const dados = snapshot.val(); 
      for (const uid in dados) {
        if (Object.prototype.hasOwnProperty.call(dados, uid)) {
          const a = dados[uid];
          lista.push(new Aluno(uid, a.nome, a.esportes || [], a.foto || ""));
        }
      }
    }
    return lista;
  }

  /**
   * Insere um novo aluno no Realtime Database.
   * @param {Aluno} aluno - O objeto Aluno a ser inserido. O 'id' do aluno será a chave do nó.
   * @throws {ModelError} Se o objeto não for uma instância de Aluno ou se a validação falhar.
   */
  async inserir(aluno) {
    if (!(aluno instanceof Aluno)) {
      throw new ModelError("Objeto inválido, esperado uma instância de Aluno.");
    }
    Aluno.validarId(aluno.id); // Garante que o ID do aluno é válido

    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, `alunos/${aluno.id}`); // Cria referência ao caminho do aluno
    await set(dbRef, aluno.toObject()); // Usa set() na referência
  }

  /**
   * Altera um aluno existente no Realtime Database.
   * @param {Aluno} aluno - O objeto Aluno com os dados atualizados. O 'id' do aluno é usado para identificar o nó.
   * @throws {ModelError} Se o objeto não for uma instância de Aluno ou se a validação falhar.
   */
  async alterar(aluno) {
    if (!(aluno instanceof Aluno)) {
      throw new ModelError("Objeto inválido, esperado uma instância de Aluno.");
    }
    Aluno.validarId(aluno.id); // Garante que o ID é válido

    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, `alunos/${aluno.id}`); // Cria referência ao caminho do aluno
    await update(dbRef, aluno.toObject()); // Usa update() na referência
  }

  /**
   * Remove um aluno do Realtime Database.
   * @param {string} uid - O ID (UID) do aluno a ser removido.
   * @throws {ModelError} Se o UID for inválido.
   */
  async remover(uid) {
    if (!uid) {
      throw new ModelError("UID do Aluno inválido para remoção.");
    }

    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, `alunos/${uid}`); 
    await remove(dbRef); 
  }
}