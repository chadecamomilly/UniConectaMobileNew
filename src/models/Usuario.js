import ModelError from "./ModelError";

export default class Usuario {
    constructor(id, nome, email, perfil, esportes = []) {
        this.setId(id);
        this.setNome(nome);
        this.setEmail(email);
        this.setTipo(perfil); 
        this.setEsportes(esportes);
    }

    getId() { return this.id; }
    getNome() { return this.nome; }
    getEmail() { return this.email; }
    getTipo() { return this.tipo; } 
    getEsportes() { return this.esportes; }

    setId(id) { Usuario.validarId(id); this.id = id; }
    setNome(nome) { Usuario.validarNome(nome); this.nome = nome; }
    setEmail(email) { Usuario.validarEmail(email); this.email = email; }
    setTipo(tipo) { Usuario.validarTipo(tipo); this.tipo = tipo; } 
    setEsportes(esportes) { Usuario.validarEsportes(esportes); this.esportes = esportes; }

    static validarId(id) {
        if (!id || typeof id !== "string" || id.trim() === "") {
            throw new ModelError("ID inválido: deve ser uma string não vazia.");
        }
    }
    static validarNome(nome) {
        if (!nome || typeof nome !== "string" || nome.trim().length < 3) {
            throw new ModelError("Nome inválido: mínimo 3 caracteres e não vazio.");
        }
    }
    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !regex.test(email.trim())) {
            throw new ModelError("E-mail inválido.");
        }
    }
    static validarTipo(tipo) {
        const tiposValidos = ["aluno", "responsavel"];
        if (!tiposValidos.includes(tipo)) {
            throw new ModelError(`Tipo inválido: use ${tiposValidos.join(" ou ")}.`);
        }
    }
    static validarEsportes(esportes) {
        if (!Array.isArray(esportes)) {
            throw new ModelError("Esportes deve ser um array de IDs de esportes.");
        }
        if (esportes.some(e => typeof e !== "string" || e.trim() === "")) {
            throw new ModelError("Cada item em Esportes deve ser uma string não vazia.");
        }
    }

    toObject() {
        return {
            nome: this.nome,
            email: this.email,
            tipo: this.tipo, 
            esportes: this.esportes || [],
        };
    }

    toString() {
        return `[${this.tipo.toUpperCase()}] ${this.nome} (${this.email})`;
    }
}