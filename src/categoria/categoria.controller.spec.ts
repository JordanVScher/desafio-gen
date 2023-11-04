import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  closeMongodConnection,
  rootMongooseTestModule,
} from '../../test/test-utils/mongo/MongooseTestModule';
import { MongooseModule } from '@nestjs/mongoose';
import { Categoria, CategoriaSchema } from './categoria.schema';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';
import { CategoriaInformaticaStub } from '../../test/test-utils/stubs/categoriaStub';

describe('Root', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Categoria.name, schema: CategoriaSchema },
        ]),
      ],
      controllers: [CategoriaController],
      providers: [CategoriaService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  describe('POST /categoria', () => {
    it(`create new categoria`, () => {
      return request(app.getHttpServer())
        .post('/categoria')
        .send(CategoriaInformaticaStub)
        .expect(201)
        .then((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body.nome).toBe(CategoriaInformaticaStub.nome);
        });
    });
  });
  afterAll(async () => {
    await app.close();
    await closeMongodConnection();
  });
});
