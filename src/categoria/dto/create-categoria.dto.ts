import { IsString, Matches } from 'class-validator';
import {
  percentageStringErrorMsg,
  percentageStringRegex,
} from '../../utils/percentage-regex';

export class CreateCategoriaDto {
  @IsString()
  nome: string;

  @IsString()
  @Matches(percentageStringRegex, { message: percentageStringErrorMsg })
  juros: string;
}
