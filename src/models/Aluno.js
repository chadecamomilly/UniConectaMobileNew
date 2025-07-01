import Usuario from "./Usuario.js";
import ModelError from "./ModelError.js";

export class Aluno extends Usuario {
  constructor(id, nome, email, esportes = [], foto = null) {
    super(id, nome, email, "aluno");
    this.esportes = esportes;
    this.setFoto(foto);
  }

  getFoto() {
    return this.foto;
  }

  setFoto(foto) {
    Aluno.validarFoto(foto);
    this.foto = foto;
  }

  getEsportes() {
    return this.esportes;
  }

  participarEsporte(idEsporte) {
    if (!idEsporte || typeof idEsporte !== "string") {
      throw new ModelError("ID do esporte inválido.");
    }

    if (!this.esportes.includes(idEsporte)) {
      this.esportes.push(idEsporte);
    } else {
      throw new ModelError("Usuário já participa desse esporte.");
    }
  }

  static validarFoto(foto) {
    if (foto !== null && typeof foto !== "string") {
      throw new ModelError("Foto inválida: deve ser uma string (URL) ou null.");
    }
    const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/gm;
    if (foto !== null && !urlRegex.test(foto)) {
      throw new ModelError("Foto inválida: deve ser uma URL válida.");
    }
  }

  toObject() {
    return {
      id: this.getId(),
      nome: this.getNome(),
      email: this.getEmail(),
      perfil: this.getTipo(),
      esportes: this.getEsportes(),
      foto: this.getFoto(),
    };
  }
}

export default Aluno;
