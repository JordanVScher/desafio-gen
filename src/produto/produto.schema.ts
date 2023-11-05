import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  monetaryStringErrorMsg,
  monetaryStringRegex,
} from '../utils/monetary-regex';
import { BadRequestException } from '@nestjs/common';

export type ProdutoDocument = HydratedDocument<Produto>;

@Schema()
export class Produto {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true })
  descricao: string;

  @Prop({ required: true })
  valor: string;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto).pre(
  'save',
  function (next) {
    const { valor } = this;

    if (monetaryStringRegex.test(valor)) next();
    throw new BadRequestException(monetaryStringErrorMsg);
  },
);
