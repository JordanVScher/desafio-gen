import { ParcelaData } from './parcela-data';

export class Parcelador {
  private valorProduto: number;
  private jurosPercentual: number;

  constructor(valorProduto: number | string, juros: number | string) {
    if (typeof valorProduto === 'string')
      valorProduto = parseFloat(valorProduto);

    if (typeof juros === 'string') juros = parseFloat(juros);

    this.valorProduto = valorProduto;
    this.jurosPercentual = juros / 100;
  }

  getParcelaValue(parcelas: number | string): number {
    const { valorProduto, jurosPercentual } = this;

    if (parcelas === 1) return valorProduto;

    const valorParcela =
      (valorProduto * jurosPercentual) /
      (1 - Math.pow(1 + jurosPercentual, -parcelas));
    return parseFloat(valorParcela.toFixed(2));
  }

  getParcelaData(parcelas: number): ParcelaData {
    const valorParcela = this.getParcelaValue(parcelas);

    return {
      originalPrice: this.valorProduto,
      installmentsQuantity: parcelas,
      installmentValue: valorParcela,
      finalPrice: parcelas * valorParcela,
    };
  }
}
