import { IsOptional, IsString, Matches } from 'class-validator';
import {
  percentageStringErrorMsg,
  percentageStringRegex,
} from '../../utils/percentage-regex';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  @Matches(percentageStringRegex, { message: percentageStringErrorMsg })
  juros: string;
}
