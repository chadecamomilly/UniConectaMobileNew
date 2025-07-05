import { getDatabase, ref, push, update, remove, get, set, child } from "firebase/database";
import { db, app } from '../../../config/firebase'

import Publicacao from "../Publicacao"; 
import ModelError from "../ModelError"; 

export default class DaoPublicacao {
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
     * Cria uma nova publicação no Realtime Database, gerando um UID automaticamente.
     * @param {Publicacao} publicacao - A instância de Publicacao a ser criada.
     * @returns {Promise<string>} O UID gerado para a nova publicação.
     * @throws {ModelError} Se o objeto não for uma instância de Publicacao, se a data for inválida ou se ocorrer um erro na criação.
     */
    async criar(publicacao) {
        if (!(publicacao instanceof Publicacao)) {
            throw new ModelError("Objeto inválido, esperado uma instância de Publicacao.");
        }

        if (!publicacao.getDataCriacao()) {
            throw new ModelError("Publicação sem data de criação válida.");
        }

        const databaseInstance = this.obterConexao();
        const publicacoesRef = ref(databaseInstance, "publicacoes"); 

        const novaPublicacaoRef = push(publicacoesRef); 
        const uid = novaPublicacaoRef.key;

        if (!uid) {
            throw new ModelError("Erro ao gerar UID para publicação.");
        }

        const publicacaoObj = publicacao.toObject(); 

        await set(novaPublicacaoRef, publicacaoObj); 

        return uid;
    }

    /**
     * Edita uma publicação existente no Realtime Database.
     * @param {string} uid - O UID da publicação a ser editada.
     * @param {Publicacao} publicacao - A instância de Publicacao com os dados atualizados.
     * @throws {ModelError} Se o UID for inválido ou o objeto não for uma instância de Publicacao.
     */
    async editar(uid, publicacao) {
        if (!uid) throw new ModelError("UID da publicação inválido para edição.");
        if (!(publicacao instanceof Publicacao)) {
            throw new ModelError("Objeto inválido, esperado uma instância de Publicacao.");
        }

        const databaseInstance = this.obterConexao();
        const publicacaoRef = ref(databaseInstance, `publicacoes/${uid}`); 

        await update(publicacaoRef, publicacao.toObject());
    }

    /**
     * Exclui uma publicação do Realtime Database.
     * @param {string} uid - O UID da publicação a ser excluída.
     * @throws {ModelError} Se o UID for inválido.
     */
    async excluir(uid) {
        if (!uid) throw new ModelError("UID da publicação inválido para exclusão.");

        const databaseInstance = this.obterConexao();
        const publicacaoRef = ref(databaseInstance, `publicacoes/${uid}`);
        await remove(publicacaoRef);
    }

    /**
     * Busca publicações por ID de esporte.
     * Nota: Esta operação lê *todas* as publicações e filtra no cliente, o que pode ser ineficiente para grandes coleções.
     * Para otimizar, seria necessário usar queries mais avançadas do Realtime Database (query, orderByChild, equalTo)
     * ou reestruturar os dados para ter um índice de esportes.
     * @param {string} esporteId - O ID do esporte a ser filtrado.
     * @returns {Promise<Publicacao[]>} Um array de objetos Publicacao.
     */
    async buscarPorEsporte(esporteId) {
        if (!esporteId) throw new ModelError("ID do esporte inválido para busca.");

        const databaseInstance = this.obterConexao();
        const publicacoesRef = ref(databaseInstance, "publicacoes");
        const snapshot = await get(publicacoesRef); 

        if (!snapshot.exists()) return [];

        const publicacoesRaw = snapshot.val();
        const resultados = [];

        for (const uid in publicacoesRaw) {
            if (Object.prototype.hasOwnProperty.call(publicacoesRaw, uid)) {
                const pubDados = publicacoesRaw[uid];
                if (Array.isArray(pubDados.esportes) && pubDados.esportes.includes(esporteId)) {
                    try {
                        const p = new Publicacao(
                            uid,
                            pubDados.data_criacao,
                            pubDados.autor,
                            pubDados.titulo,
                            pubDados.conteudo,
                            pubDados.esportes
                        );
                        resultados.push(p);
                    } catch (e) {
                        console.warn(`Publicação com UID ${uid} inválida ignorada na busca por esporte:`, e);
                    }
                }
            }
        }
        return resultados;
    }

    /**
     * Busca todas as publicações e as ordena por data de criação (mais recente primeiro).
     * @returns {Promise<Publicacao[]>} Um array de objetos Publicacao.
     */
    async buscarTodos() {
        const databaseInstance = this.obterConexao();
        const publicacoesRef = ref(databaseInstance, "publicacoes");
        const snapshot = await get(publicacoesRef);

        if (!snapshot.exists()) return [];

        const publicacoesRaw = snapshot.val();
        const resultados = [];

        for (const uid in publicacoesRaw) {
            if (Object.prototype.hasOwnProperty.call(publicacoesRaw, uid)) {
                const pubDados = publicacoesRaw[uid];
                try {
                    const p = new Publicacao(
                        uid,
                        pubDados.data_criacao,
                        pubDados.autor,
                        pubDados.titulo,
                        pubDados.conteudo,
                        pubDados.esportes
                    );
                    resultados.push(p);
                } catch (e) {
                    console.warn(`Publicação com UID ${uid} inválida ignorada na busca de todos:`, e);
                }
            }
        }

        resultados.sort((a, b) => new Date(b.getDataCriacao()) - new Date(a.getDataCriacao()));

        return resultados;
    }

    /**
     * Busca uma publicação específica pelo seu UID.
     * @param {string} uid - O UID da publicação.
     * @returns {Promise<Publicacao|null>} O objeto Publicacao ou null se não encontrado.
     * @throws {ModelError} Se o UID for inválido.
     */
    async buscarPorId(uid) {
        if (!uid) throw new ModelError("UID da publicação inválido para busca por ID.");

        const databaseInstance = this.obterConexao();
        const publicacaoRef = ref(databaseInstance, `publicacoes/${uid}`);
        const snapshot = await get(publicacaoRef);

        if (!snapshot.exists()) return null;

        const dados = snapshot.val();
        return new Publicacao(
            uid,
            dados.data_criacao,
            dados.autor,
            dados.titulo,
            dados.conteudo,
            dados.esportes
        );
    }
}