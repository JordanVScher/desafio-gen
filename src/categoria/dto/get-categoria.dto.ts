import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCategoriaDTO {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  size?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  page?: number;
}
