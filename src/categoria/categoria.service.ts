import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './categoria.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectModel(Categoria.name) private categoriaModel: Model<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const createdCategoria = new this.categoriaModel(createCategoriaDto);
    return createdCategoria.save();
  }

  findAll() {
    return `This action returns all categoria`;
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

  remove(id: number) {
    return `This action removes a #${id} categoria`;
  }
}
