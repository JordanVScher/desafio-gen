import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetParcelasDTO {
  @IsInt()
  @Min(1)
  @Max(128)
  @Type(() => Number)
  parcelas?: string;
}
