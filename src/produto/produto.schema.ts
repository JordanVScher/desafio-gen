import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  monetaryStringErrorMsg,
  monetaryStringRegex,
} from '../utils/monetary-regex';
import { BadRequestException } from '@nestjs/common';
import { Categoria } from '../categoria/categoria.schema';

export type ProdutoDocument = HydratedDocument<Produto>;

@Schema()
export class Produto {
  @Prop({ required: true, unique: true })
  nome: string;

  @Prop({ required: true })
  descricao: string;

  @Prop({ required: true })
  valor: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Categoria.name,
    required: true,
  })
  idCategoria: mongoose.Schema.Types.ObjectId;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto).pre(
  'save',
  function (next) {
    const { valor } = this;

    if (!monetaryStringRegex.test(valor))
      throw new BadRequestException(monetaryStringErrorMsg);

    next();
  },
);
