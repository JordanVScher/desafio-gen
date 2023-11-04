import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  closeMongodConnection,
  rootMongooseTestModule,
} from '../../test/test-utils/mongo/MongooseTestModule';
import { MongooseModule } from '@nestjs/mongoose';
import { Categoria, CategoriaSchema } from './categoria.schema';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';
import { CategoriaInformaticaStub } from '../../test/test-utils/stubs/categoriaStub';
import { MongoExceptionFilter } from '../filters/MongoExceptionFilter';

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

    await app.useGlobalFilters(new MongoExceptionFilter());
    await app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  describe('POST /categoria', () => {
    let newCategoria;

    it(`create new categoria`, () => {
      return request(app.getHttpServer())
        .post('/categoria')
        .send(CategoriaInformaticaStub)
        .expect(201)
        .then((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body.nome).toBe(CategoriaInformaticaStub.nome);
          newCategoria = res.body;
        });
    });

    it(`Error: no 'nome' for new categoria`, () => {
      return request(app.getHttpServer())
        .post('/categoria')
        .send({})
        .expect(400)
        .then((res) => {
          expect(res.body.message[0]).toBe('nome must be a string');
        });
    });

    it(`get created categoria`, () => {
      return request(app.getHttpServer())
        .get(`/categoria/${newCategoria._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body.nome).toBe(newCategoria.nome);
        });
    });

    it(`Error: invalid id`, () => {
      return request(app.getHttpServer())
        .get(`/categoria/foobar`)
        .expect(500)
        .then((res) => {
          expect(res.body.message).toBe(
            'CastError: Cast to ObjectId failed for value "foobar" (type string) at path "_id" for model "Categoria"',
          );
        });
    });
  });
  afterAll(async () => {
    await app.close();
    await closeMongodConnection();
  });
});
