import { CreateProdutoDto } from '../../../src/produto/dto/create-produto.dto';

export const ProdutoNotebookStub = (idCategoria: string): CreateProdutoDto => ({
  nome: 'Notebook',
  descricao: 'i7',
  valor: '6000.00',
  idCategoria,
});

export const ProdutoFuscaStub = (idCategoria: string): CreateProdutoDto => ({
  nome: 'Fusca',
  descricao: '1950',
  valor: '10000.00',
  idCategoria,
});

export const InvalidValorStub = (idCategoria: string): CreateProdutoDto => ({
  nome: 'Cabo HDMI',
  descricao: '10 metros',
  valor: '34,00',
  idCategoria,
});

export const newNomeProduto = 'PC';
