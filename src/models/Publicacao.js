import ModelError from "./ModelError.js";

export default class Publicacao {
  constructor(uid = null, dataCriacao = null, autor, titulo, conteudo, esportes = []) {
    if (uid) this.setUid(uid);
    if (dataCriacao) this.setDataCriacao(dataCriacao);
    this.setAutor(autor);
    this.setTitulo(titulo);
    this.setConteudo(conteudo);
    this.setEsportes(esportes);
  }

  getUid() { return this.uid; }
  setUid(uid) { Publicacao.validarUid(uid); this.uid = uid; }

  getDataCriacao() { return this.dataCriacao; }
  setDataCriacao(dataCriacao) { Publicacao.validarDataCriacao(dataCriacao); this.dataCriacao = dataCriacao; }

  getAutor() { return this.autor; }
  setAutor(autor) { Publicacao.validarAutor(autor); this.autor = autor; }

  getTitulo() { return this.titulo; }
  setTitulo(titulo) { Publicacao.validarTitulo(titulo); this.titulo = titulo; }

  getConteudo() { return this.conteudo; }
  setConteudo(conteudo) { Publicacao.validarConteudo(conteudo); this.conteudo = conteudo; }

  getEsportes() { return this.esportes; }
  setEsportes(esportes) { Publicacao.validarEsportes(esportes); this.esportes = esportes; }

  static validarUid(uid) {
    if (!uid || typeof uid !== "string" || uid.trim() === "") {
      throw new ModelError("UID inválido: deve ser uma string não vazia.");
    }
  }
  static validarDataCriacao(dataCriacao) {
    if (!dataCriacao || typeof dataCriacao !== "string" || isNaN(Date.parse(dataCriacao))) {
      throw new ModelError("Data de criação inválida: deve ser uma string de data válida.");
    }
  }
  static validarAutor(autor) {

    if (!autor || typeof autor !== "string" || autor.trim().length < 3) {

      throw new ModelError("Autor inválido: mínimo 3 caracteres.");

    }

  }



  static validarTitulo(titulo) {

    if (!titulo || typeof titulo !== "string" || titulo.trim().length < 3) {

      throw new ModelError("Título inválido: mínimo 3 caracteres.");

    }

  }



  static validarConteudo(conteudo) {

    if (!conteudo || typeof conteudo !== "string" || conteudo.trim().length < 3) {

      throw new ModelError("Conteúdo inválido: mínimo 3 caracteres.");

    }

  }



  static validarEsportes(esportes) {

    if (!Array.isArray(esportes) || esportes.length === 0) {

      throw new ModelError("Esportes deve ser um array não vazio.");

    }

  }

  toObject() {
    return {
      autor: this.autor,
      titulo: this.titulo,
      conteudo: this.conteudo,
      data_criacao: this.dataCriacao, 
      esportes: this.esportes,
    };
  }

  toString() {
    return `[Publicacao ${this.uid}] ${this.titulo} por ${this.autor} em ${this.dataCriacao}`;
  }
}