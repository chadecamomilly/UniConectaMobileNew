import Usuario from "../models/Usuario"; 
import DaoUsuario from "../models/dao/DaoUsuario"; 
import ModelError from "../models/ModelError"; 

export default class UsuarioController {
  constructor() {
    this.dao = new DaoUsuario(); // Instancia o DaoUsuario (que já usa o SDK web)
  }

  /**
   * Cria um novo usuário no sistema.
   * @param {object} dadosUsuario - Objeto contendo id, nome, email, perfil, e esportes (opcional).
   * @returns {object} Objeto de resposta com sucesso/erro e mensagem.
   */
  async criarUsuario(dadosUsuario) {
    try {
      if (
        !dadosUsuario.id ||
        !dadosUsuario.nome ||
        !dadosUsuario.email ||
        !dadosUsuario.perfil
      ) {
        return this._retornarErro(
          "Os campos 'id', 'nome', 'email' e 'perfil' são obrigatórios."
        );
      }

      const usuario = new Usuario(
        dadosUsuario.id,
        dadosUsuario.nome,
        dadosUsuario.email,
        dadosUsuario.perfil,
        dadosUsuario.esportes 
      );

      try {
        const existente = await this.dao.obterUsuarioPorUid(usuario.getId());
        if (existente) {
          return this._retornarErro(
            `Usuário com ID ${usuario.getId()} já existe.`
          );
        }
      } catch (err) {
        if (
          !(err instanceof ModelError && err.message.includes("não encontrado"))
        ) {
          console.error("Erro ao consultar usuário existente:", err);
          return this._retornarErro(
            "Erro interno ao verificar usuário existente."
          );
        }
      }

      await this.dao.inserir(usuario);

      return this._retornarSucesso(
        "Usuário criado com sucesso.",
        usuario.toObject()
      );
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em criarUsuario:", error);
      return this._retornarErro("Erro inesperado ao criar usuário.");
    }
  }

  /**
   * Altera um usuário existente no sistema.
   * @param {object} dadosUsuario - Objeto contendo id, nome, email, perfil, e esportes (opcional).
   * @returns {object} Objeto de resposta com sucesso/erro e mensagem.
   */
  async alterarUsuario(dadosUsuario) {
    try {
      if (!dadosUsuario.id) {
        return this._retornarErro(
          "ID do usuário é obrigatório para alteração."
        );
      }

      const usuario = new Usuario(
        dadosUsuario.id,
        dadosUsuario.nome,
        dadosUsuario.email,
        dadosUsuario.perfil,
        dadosUsuario.esportes 
      );

      try {
        await this.dao.obterUsuarioPorUid(usuario.getId());
      } catch (err) {
        if (
          err instanceof ModelError &&
          err.message.includes("não encontrado")
        ) {
          return this._retornarErro(
            `Usuário com ID ${usuario.getId()} não encontrado para alteração.`
          );
        }
        console.error("Erro ao verificar usuário para alteração:", err);
        return this._retornarErro("Erro interno ao alterar usuário.");
      }

      await this.dao.alterar(usuario);
      return this._retornarSucesso(
        "Usuário alterado com sucesso.",
        usuario.toObject()
      );
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em alterarUsuario:", error);
      return this._retornarErro("Erro inesperado ao alterar usuário.");
    }
  }

  /**
   * Remove um usuário do sistema.
   * @param {string} id - O ID do usuário a ser removido.
   * @returns {object} Objeto de resposta com sucesso/erro e mensagem.
   */
  async removerUsuario(id) {
    try {
      if (!id) {
        return this._retornarErro("ID do usuário é obrigatório para remoção.");
      }

      try {
        await this.dao.obterUsuarioPorUid(id);
      } catch (err) {
        if (
          err instanceof ModelError &&
          err.message.includes("não encontrado")
        ) {
          return this._retornarErro(`Usuário com ID ${id} não encontrado para remoção.`);
        }
        console.error("Erro ao verificar usuário para remoção:", err);
        return this._retornarErro("Erro interno ao remover usuário.");
      }

      await this.dao.remover(id);
      return this._retornarSucesso("Usuário removido com sucesso.");
    } catch (error) {
      console.error("Erro inesperado em removerUsuario:", error);
      return this._retornarErro("Erro inesperado ao remover usuário.");
    }
  }

  /**
   * Lista todos os usuários do sistema.
   * @returns {object} Objeto de resposta com sucesso/erro e lista de usuários.
   */
  async listarUsuarios() {
    try {
      const lista = await this.dao.obterUsuarios();
      return this._retornarSucesso(
        "Lista de usuários obtida com sucesso.",
        lista.map((u) => u.toObject())
      );
    } catch (error) {
      console.error("Erro inesperado em listarUsuarios:", error);
      return this._retornarErro("Erro ao listar usuários.");
    }
  }

  /**
   * Busca um usuário pelo seu ID.
   * @param {string} id - O ID do usuário a ser buscado.
   * @returns {object} Objeto de resposta com sucesso/erro e os dados do usuário.
   */
  async buscarUsuarioPorId(id) {
    try {
      if (!id) {
        return this._retornarErro("ID do usuário é obrigatório para busca.");
      }

      const usuario = await this.dao.obterUsuarioPorUid(id);
      return this._retornarSucesso("Usuário encontrado.", usuario.toObject());
    } catch (error) {
      if (error instanceof ModelError) {
        return this._retornarErro(error.message);
      }
      console.error("Erro inesperado em buscarUsuarioPorId:", error);
      return this._retornarErro("Erro inesperado ao buscar usuário.");
    }
  }

  // Métodos auxiliares para padronizar o formato de retorno das operações
  _retornarSucesso(mensagem, dados = null) {
    return { sucesso: true, mensagem, dados };
  }

  _retornarErro(mensagem) {
    return { sucesso: false, mensagem };
  }
}