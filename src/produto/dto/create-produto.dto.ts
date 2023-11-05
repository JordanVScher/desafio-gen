import { IsString } from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  nome: string;

  @IsString()
  descricao: string;

  @IsString()
  valor: string;
}
