import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoService } from './produto.service';
import {
  closeMongodConnection,
  rootMongooseTestModule,
} from '../../test/test-utils/mongo/MongooseTestModule';
import { MongooseModule } from '@nestjs/mongoose';
import { Produto, ProdutoSchema } from './produto.schema';
import { Categoria, CategoriaSchema } from '../categoria/categoria.schema';

describe('ProdutoService', () => {
  let service: ProdutoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Produto.name, schema: ProdutoSchema },
        ]),
        MongooseModule.forFeature([
          { name: Categoria.name, schema: CategoriaSchema },
        ]),
      ],
      providers: [ProdutoService],
    }).compile();

    service = module.get<ProdutoService>(ProdutoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    await closeMongodConnection();
  });
});
