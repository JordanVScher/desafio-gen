import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Produto } from './produto.schema';
import { Model } from 'mongoose';
import { Categoria } from '../categoria/categoria.schema';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectModel(Produto.name) private produtoModel: Model<Produto>,
    @InjectModel(Categoria.name) private categoriaModel: Model<Categoria>,
  ) {}

  create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    if (!this.categoriaModel.exists({ _id: createProdutoDto.idCategoria }))
      throw new BadRequestException('Categoria não existe');

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
    if (
      updateDto.idCategoria &&
      !this.categoriaModel.exists({ _id: updateDto.idCategoria })
    )
      throw new BadRequestException('Categoria não existe');

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
