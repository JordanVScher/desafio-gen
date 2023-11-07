import { IsString, Matches } from 'class-validator';
import {
  monetaryStringErrorMsg,
  monetaryStringRegex,
} from '../../utils/monetary-regex';

export class CreateProdutoDto {
  @IsString()
  nome: string;

  @IsString()
  descricao: string;

  @IsString()
  @Matches(monetaryStringRegex, { message: monetaryStringErrorMsg })
  valor: string;

  @IsString()
  idCategoria: string;
}
