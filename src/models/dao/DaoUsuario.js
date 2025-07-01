import { getDatabase, ref, get, set, update, remove } from "firebase/database";
import app from "../../../config/firebase"; 

import Usuario from "../Usuario"; 
import ModelError from "../ModelError"; 

export default class DaoUsuario {
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
   * Obtém um usuário do Realtime Database pelo seu UID (que é a chave do nó).
   * @param {string} uid - O ID (UID) do usuário.
   * @returns {Promise<Usuario>} - Uma promessa que resolve para um objeto Usuario.
   * @throws {ModelError} Se o UID for inválido ou o usuário não for encontrado.
   */
  async obterUsuarioPorUid(uid) {
    if (!uid) {
      throw new ModelError("UID inválido");
    }

    const databaseInstance = this.obterConexao(); 
    const dbRef = ref(databaseInstance, `usuarios/${uid}`); 
    const snapshot = await get(dbRef); 

    if (!snapshot.exists()) {
      throw new ModelError(`Usuário com UID ${uid} não encontrado.`);
    }

    const dados = snapshot.val();
    return new Usuario(uid, dados.nome, dados.email, dados.tipo || dados.perfil, dados.esportes || []);
  }

  /**
   * Obtém todos os usuários do Realtime Database.
   * @returns {Promise<Usuario[]>} - Uma promessa que resolve para um array de objetos Usuario.
   */
  async obterUsuarios() {
    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, "usuarios/"); 
    const snapshot = await get(dbRef);

    const lista = [];
    if (snapshot.exists()) {
      const dados = snapshot.val();
      for (let uid in dados) {
        if (Object.prototype.hasOwnProperty.call(dados, uid)) {
          const u = dados[uid];
          lista.push(new Usuario(uid, u.nome, u.email, u.tipo || u.perfil, u.esportes || []));
        }
      }
    }
    return lista;
  }

  /**
   * Insere um novo usuário no Realtime Database.
   * @param {Usuario} usuario - O objeto Usuario a ser inserido. O 'id' do usuário será a chave do nó.
   * @throws {ModelError} Se o objeto não for uma instância de Usuario ou se a validação falhar.
   */
  async inserir(usuario) {
    if (!(usuario instanceof Usuario)) {
      throw new ModelError("Objeto inválido, esperado um Usuario.");
    }
    Usuario.validarId(usuario.id); 

    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, `usuarios/${usuario.id}`);
    await set(dbRef, usuario.toObject()); 
  }

  /**
   * Altera um usuário existente no Realtime Database.
   * @param {Usuario} usuario - O objeto Usuario com os dados atualizados. O 'id' do usuário é usado para identificar o nó.
   * @throws {ModelError} Se o objeto não for uma instância de Usuario ou se a validação falhar.
   */
  async alterar(usuario) {
    if (!(usuario instanceof Usuario)) {
      throw new ModelError("Objeto inválido, esperado um Usuario.");
    }
    Usuario.validarId(usuario.id); 

    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, `usuarios/${usuario.id}`); 
    await update(dbRef, usuario.toObject()); 
  }

  /**
   * Remove um usuário do Realtime Database.
   * @param {string} uid - O ID (UID) do usuário a ser removido.
   * @throws {ModelError} Se o UID for inválido.
   */
  async remover(uid) {
    if (!uid) {
      throw new ModelError("UID inválido");
    }

    const databaseInstance = this.obterConexao();
    const dbRef = ref(databaseInstance, `usuarios/${uid}`); 
    await remove(dbRef); 
  }
}