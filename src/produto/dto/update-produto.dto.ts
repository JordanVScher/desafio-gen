import { IsOptional, IsString, Matches } from 'class-validator';
import {
  monetaryStringErrorMsg,
  monetaryStringRegex,
} from '../../utils/monetary-regex';

export class UpdateProdutoDto {
  @IsOptional()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao: string;

  @IsOptional()
  @IsString()
  @Matches(monetaryStringRegex, { message: monetaryStringErrorMsg })
  valor: string;

  @IsOptional()
  @IsString()
  idCategoria: string;
}
