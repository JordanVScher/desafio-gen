import { Injectable } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Produto } from './produto.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectModel(Produto.name) private produtoModel: Model<Produto>,
  ) {}

  create(createProdutoDto: CreateProdutoDto) {
    const createdProduto = new this.produtoModel(createProdutoDto);
    return createdProduto.save();
  }

  findAll() {
    return `This action returns all produto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} produto`;
  }

  // eslint-disable-next-line
  update(id: number, updateProdutoDto: UpdateProdutoDto) {
    return `This action updates a #${id} produto`;
  }

  remove(id: number) {
    return `This action removes a #${id} produto`;
  }
}
