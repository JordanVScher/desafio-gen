import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { GetCategoriaDTO } from './dto/get-categoria.dto';
import { Categoria } from './categoria.schema';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @ApiCreatedResponse({ description: 'Created categoria', type: Categoria })
  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    return this.categoriaService.create(createCategoriaDto);
  }

  @ApiOkResponse({
    description: 'Categorias found',
    type: Categoria,
    isArray: true,
  })
  @Get()
  findAll(@Query() query: GetCategoriaDTO): Promise<Categoria[]> {
    return this.categoriaService.findAll(query.size, query.page);
  }

  @ApiOkResponse({ description: 'Found categoria', type: Categoria })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Categoria> {
    return this.categoriaService.findOne(id);
  }

  @ApiOkResponse({ description: 'Updated categoria', type: Categoria })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    return this.categoriaService.update(id, updateCategoriaDto);
  }

  @ApiOkResponse({ description: 'Deleted categoria', type: Categoria })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Categoria> {
    return this.categoriaService.remove(id);
  }
}
