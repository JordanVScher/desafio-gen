import { IsOptional, IsString } from 'class-validator';

export class UpdateProdutoDto {
  @IsOptional()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao: string;

  @IsOptional()
  @IsString()
  valor: string;
}
