import Publicacao from "../models/Publicacao"; 
import DaoPublicacao from "../models/dao/DaoPublicacao"; 
import ModelError from "../models/ModelError"; 

export default class PublicacaoController {
  constructor() {
    this.dao = new DaoPublicacao();
  }

  /**
   * Cria uma nova publicação.
   * @param {object} dadosPublicacao - Objeto contendo autor, titulo, conteudo, esportes.
   * @returns {object} Objeto de resposta com sucesso/erro e o UID da nova publicação.
   */
  async criarPublicacao({ autor, titulo, conteudo, esportes }) {
    try {
      if (!autor || !titulo || !conteudo || !esportes || !Array.isArray(esportes) || esportes.length === 0) {
        return this._retornarErro("Todos os campos (autor, titulo, conteudo, esportes) são obrigatórios e esportes deve ser um array não vazio.");
      }

      const dataCriacao = new Date().toISOString(); // Gera data de criação no formato ISO
      const novaPub = new Publicacao(null, dataCriacao, autor, titulo, conteudo, esportes);

      const uid = await this.dao.criar(novaPub);

      return this._retornarSucesso("Publicação criada com sucesso.", { uid, ...novaPub.toObject() });
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em criarPublicacao:", error);
      return this._retornarErro("Erro inesperado ao criar publicação.");
    }
  }

  /**
   * Edita uma publicação existente.
   * @param {string} uid - O UID da publicação a ser editada.
   * @param {object} dados - Objeto contendo os dados a serem atualizados (autor, titulo, conteudo, esportes).
   * @returns {object} Objeto de resposta com sucesso/erro.
   */
  async editarPublicacao(uid, dados) {
    try {
      if (!uid) {
        return this._retornarErro("UID da publicação é obrigatório para edição.");
      }
      // Validação inicial dos campos obrigatórios (se necessário, para dados)
      if (!dados || !dados.autor || !dados.titulo || !dados.conteudo || !dados.esportes || !Array.isArray(dados.esportes) || dados.esportes.length === 0) {
        return this._retornarErro("Dados de edição (autor, titulo, conteudo, esportes) são obrigatórios e esportes deve ser um array não vazio.");
      }


      // Busca a publicação existente para manter a data de criação e garantir que ela existe
      const publicacaoExistente = await this.dao.buscarPorId(uid);
      if (!publicacaoExistente) {
        return this._retornarErro("Publicação não encontrada para edição.");
      }

      // Cria uma nova instância de Publicacao com os dados atualizados
      // Reutiliza a data de criação da publicação existente
      const pubEditada = new Publicacao(
        uid,
        publicacaoExistente.getDataCriacao(), // Mantém a data de criação original
        dados.autor,
        dados.titulo,
        dados.conteudo,
        dados.esportes
      );

      // Edita a publicação no banco via DAO
      await this.dao.editar(uid, pubEditada);

      return this._retornarSucesso("Publicação editada com sucesso.", pubEditada.toObject());
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em editarPublicacao:", error);
      return this._retornarErro("Erro inesperado ao editar publicação.");
    }
  }

  /**
   * Exclui uma publicação.
   * @param {string} uid - O UID da publicação a ser excluída.
   * @returns {object} Objeto de resposta com sucesso/erro.
   */
  async excluirPublicacao(uid) {
    try {
      if (!uid) {
        return this._retornarErro("UID da publicação é obrigatório para exclusão.");
      }

      // Opcional: Verificar se a publicação existe antes de excluir para dar um erro mais específico
      const publicacaoExistente = await this.dao.buscarPorId(uid);
      if (!publicacaoExistente) {
        return this._retornarErro("Publicação não encontrada para exclusão.");
      }

      // Exclui a publicação no banco via DAO
      await this.dao.excluir(uid);

      return this._retornarSucesso("Publicação excluída com sucesso.");
    } catch (error) {
      if (error instanceof ModelError) { // Caso o DAO lance ModelError (ex: UID inválido)
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em excluirPublicacao:", error);
      return this._retornarErro("Erro inesperado ao excluir publicação.");
    }
  }

  /**
   * Lista publicações filtradas por ID de esporte.
   * @param {string} esporteId - O ID do esporte.
   * @returns {object} Objeto de resposta com sucesso/erro e a lista de publicações.
   */
  async listarPublicacoesPorEsporte(esporteId) {
    try {
      if (!esporteId) {
        return this._retornarErro("ID do esporte é obrigatório para listar publicações.");
      }

      const publicacoes = await this.dao.buscarPorEsporte(esporteId);
      // Mapeia cada instância de Publicacao para sua representação de objeto simples
      return this._retornarSucesso(
        "Publicações por esporte obtidas com sucesso.",
        publicacoes.map(pub => ({ uid: pub.getUid(), ...pub.toObject() })) // Inclui o UID aqui, pois toObject não o tem
      );
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em listarPublicacoesPorEsporte:", error);
      return this._retornarErro("Erro ao listar publicações por esporte.");
    }
  }

  /**
   * Lista todas as publicações.
   * @returns {object} Objeto de resposta com sucesso/erro e a lista de publicações.
   */
  async listarTodasPublicacoes() {
    try {
      const publicacoes = await this.dao.buscarTodos();
      // Mapeia cada instância de Publicacao para sua representação de objeto simples
      return this._retornarSucesso(
        "Todas as publicações obtidas com sucesso.",
        publicacoes.map(pub => ({ uid: pub.getUid(), ...pub.toObject() })) // Inclui o UID aqui
      );
    } catch (error) {
      if (error instanceof ModelError) { // Se o DAO lançar ModelError (ex: "Não há dados de publicação")
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em listarTodasPublicacoes:", error);
      return this._retornarErro("Erro ao listar todas as publicações.");
    }
  }

  /**
   * Busca uma publicação pelo seu UID.
   * @param {string} uid - O UID da publicação.
   * @returns {object} Objeto de resposta com sucesso/erro e os dados da publicação.
   */
  async buscarPublicacaoPorId(uid) {
    try {
      if (!uid) {
        return this._retornarErro("UID da publicação é obrigatório para busca.");
      }

      const publicacao = await this.dao.buscarPorId(uid);
      if (!publicacao) {
        return this._retornarErro(`Publicação com UID ${uid} não encontrada.`);
      }

      return this._retornarSucesso("Publicação encontrada.", { uid: publicacao.getUid(), ...publicacao.toObject() });
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em buscarPublicacaoPorId:", error);
      return this._retornarErro("Erro inesperado ao buscar publicação.");
    }
  }

  _retornarSucesso(mensagem, dados = null) {
    return { sucesso: true, mensagem, dados };
  }

  _retornarErro(mensagem) {
    return { sucesso: false, mensagem };
  }
}