import { CreateProdutoDto } from '../../../src/produto/dto/create-produto.dto';

export const ProdutoNotebookStub: CreateProdutoDto = {
  nome: 'Notebook',
  descricao: 'i7',
  valor: '6000.00',
};

export const ProdutoFuscaStub: CreateProdutoDto = {
  nome: 'Fusca',
  descricao: '1950',
  valor: '10000.00',
};

export const InvalidValorStub: CreateProdutoDto = {
  nome: 'Cabo HDMI',
  descricao: '10 metros',
  valor: '34,00',
};

export const newNomeProduto = 'PC';
