import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoriaDocument = HydratedDocument<Categoria>;

@Schema()
export class Categoria {
  @Prop({ required: true, unique: true })
  nome: string;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);
