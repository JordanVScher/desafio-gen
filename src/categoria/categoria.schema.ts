import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  percentageStringErrorMsg,
  percentageStringRegex,
} from '../utils/percentage-regex';
import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export type CategoriaDocument = HydratedDocument<Categoria>;

@Schema()
export class Categoria {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  nome: string;

  // since produto's valor is to be saved as a string, so will categoria's juros
  @ApiProperty()
  @Prop({ required: true, unique: true })
  juros: string;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria).pre(
  'save',
  function (next) {
    const { juros } = this;

    if (!percentageStringRegex.test(juros))
      throw new BadRequestException(percentageStringErrorMsg);

    next();
  },
);
