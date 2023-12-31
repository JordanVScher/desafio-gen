import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './categoria.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Produto } from '../produto/produto.schema';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectModel(Categoria.name) private categoriaModel: Model<Categoria>,
    @InjectModel(Produto.name) private produtoModel: Model<Produto>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const createdCategoria = new this.categoriaModel(createCategoriaDto);
    return createdCategoria.save();
  }

  async findAll(size: number = 20, page: number = 0): Promise<Categoria[]> {
    const categoriasFound = await this.categoriaModel.find(
      {},
      {},
      { skip: size * page, limit: size },
    );

    return categoriasFound;
  }

  async findOne(id: string): Promise<Categoria> {
    const foundCategoria = await this.categoriaModel.findById(id);
    if (!foundCategoria) throw new NotFoundException('Categoria not found');
    return foundCategoria;
  }

  async update(_id: string, updateDto: UpdateCategoriaDto): Promise<Categoria> {
    const updatedCategoria = await this.categoriaModel.findOneAndUpdate(
      { _id },
      updateDto,
      { new: true },
    );

    if (!updatedCategoria) throw new NotFoundException('Categoria not found');
    return updatedCategoria;
  }

  async remove(_id: string): Promise<Categoria> {
    const deletedCategoria = await this.categoriaModel.findOneAndDelete({
      _id,
    });

    if (!deletedCategoria) throw new NotFoundException('Categoria not found');

    await this.produtoModel.deleteMany({ idCategoria: _id });
    return deletedCategoria;
  }
}
