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
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { GetProdutoDTO } from './dto/get-produto.dto';
import { GetParcelasDTO } from './dto/get-parcelas.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Produto } from './produto.schema';
import { ParcelaData } from '../utils/parcela/parcela-data';

@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @ApiCreatedResponse({ description: 'Created Produto', type: Produto })
  @Post()
  create(@Body() createProdutoDto: CreateProdutoDto): Promise<Produto> {
    return this.produtoService.create(createProdutoDto);
  }

  @ApiOkResponse({
    description: 'Found Produtos',
    type: Produto,
    isArray: true,
  })
  @Get()
  findAll(@Query() query: GetProdutoDTO): Promise<Produto[]> {
    return this.produtoService.findAll(query.size, query.page);
  }

  @ApiOkResponse({ description: 'Found Produto', type: Produto })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Produto> {
    return this.produtoService.findOne(id);
  }

  @ApiOkResponse({ description: 'Updated Produto', type: Produto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProdutoDto: UpdateProdutoDto,
  ): Promise<Produto> {
    return this.produtoService.update(id, updateProdutoDto);
  }

  @ApiOkResponse({ description: 'Deleted Produto', type: Produto })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Produto> {
    return this.produtoService.remove(id);
  }

  @ApiOkResponse({
    description: 'Data of desired parcelamento',
    type: GetParcelasDTO,
  })
  @Get('/:id/parcelas')
  getParcelas(
    @Param('id') id: string,
    @Query() query: GetParcelasDTO,
  ): Promise<ParcelaData> {
    return this.produtoService.getParcelas(id, query.parcelas);
  }
}
