export default class Esportes {
  constructor(esportes = {}) {
    this._esportes = {
      futsal: true,
      volei: true,
      basquete: true,
      natacao: true,
      handebol: true,
      cheerleading: true,
      geral: true,
    };

    for (const [nome, valor] of Object.entries(esportes)) {
      this.setEsporte(nome, valor);
    }
  }

  static esportesValidos() {
    return [
      "basquete",
      "cheerleading",
      "futsal",
      "handebol",
      "natacao",
      "volei",
      "geral",
    ];
  }

  static validarEsporte(nome, valor) {
    if (!this.esportesValidos().includes(nome)) {
      throw new Error(`Esporte inválido: ${nome}`);
    }
    if (typeof valor !== "boolean") {
      throw new Error(`Valor inválido para ${nome}: deve ser booleano`);
    }
  }

  getEsporte(nome) {
    if (!Esportes.esportesValidos().includes(nome)) {
      throw new Error(`Esporte inválido: ${nome}`);
    }
    return this._esportes[nome];
  }

  setEsporte(nome, valor) {
    Esportes.validarEsporte(nome, valor);
    this._esportes[nome] = valor;
  }

  getTodos() {
    return { ...this._esportes };
  }

  getEsportesAtivos() {
    return Object.entries(this._esportes)
      .filter(([_, ativo]) => ativo)
      .map(([nome]) => nome);
  }

  toObject() {
    return { ...this._esportes };
  }
}
