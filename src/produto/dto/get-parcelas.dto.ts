import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetParcelasDTO {
  @IsInt()
  @Min(1)
  @Max(128)
  @Type(() => Number)
  @ApiProperty()
  parcelas?: string;
}
