import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

export const ProdutoSchema = SchemaFactory.createForClass(Produto);
