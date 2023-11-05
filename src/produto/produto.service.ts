import { Injectable, NotFoundException } from '@nestjs/common';
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

  create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const createdProduto = new this.produtoModel(createProdutoDto);
    return createdProduto.save();
  }

  async findAll(size: number = 20, page: number = 0): Promise<Produto[]> {
    const produtosFound = await this.produtoModel.find(
      {},
      {},
      { skip: size * page, limit: size },
    );

    return produtosFound;
  }

  async findOne(id: string): Promise<Produto> {
    const foundProduto = await this.produtoModel.findById(id);
    if (!foundProduto) throw new NotFoundException('Produto not found');
    return foundProduto;
  }

  async update(_id: string, updateDto: UpdateProdutoDto): Promise<Produto> {
    const updatedProduto = await this.produtoModel.findOneAndUpdate(
      { _id },
      updateDto,
      { new: true },
    );

    if (!updatedProduto) throw new NotFoundException('Produto not found');
    return updatedProduto;
  }

  async remove(_id: string): Promise<Produto> {
    const deletedProduto = await this.produtoModel.findOneAndDelete({
      _id,
    });

    if (!deletedProduto) throw new NotFoundException('Produto not found');
    return deletedProduto;
  }
}
