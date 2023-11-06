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
import {
  CategoriaAutomotivoStub,
  CategoriaInformaticaStub,
  newNomeCategoria,
} from '../../test/test-utils/stubs/categoriaStub';
import { MongoExceptionFilter } from '../filters/MongoExceptionFilter';
import { MongoServerExceptionFilter } from '../filters/MongoServerExceptionFilter';
import { Produto, ProdutoSchema } from '../produto/produto.schema';
import { percentageStringErrorMsg } from '../utils/percentage-regex';

describe('Root', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Categoria.name, schema: CategoriaSchema },
        ]),
        MongooseModule.forFeature([
          { name: Produto.name, schema: ProdutoSchema },
        ]),
      ],
      controllers: [CategoriaController],
      providers: [CategoriaService],
    }).compile();

    app = module.createNestApplication();

    await app.useGlobalPipes(new ValidationPipe());
    await app.useGlobalFilters(new MongoExceptionFilter());
    await app.useGlobalFilters(new MongoServerExceptionFilter());

    await app.init();
  });

  let newCategoria;

  it(`Create new categoria`, () => {
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

  it(`Create another categoria`, () => {
    return request(app.getHttpServer())
      .post('/categoria')
      .send(CategoriaAutomotivoStub)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.nome).toBe(CategoriaAutomotivoStub.nome);
      });
  });

  it(`Error: invalid 'nome' for new categoria`, () => {
    return request(app.getHttpServer())
      .post('/categoria')
      .send({ nome: 123, juros: '10' })
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(1);
        expect(res.body.message[0]).toBe('nome must be a string');
      });
  });

  it(`Error: invalid 'juros' for new categoria`, () => {
    return request(app.getHttpServer())
      .post('/categoria')
      .send({ nome: 'foobar', juros: 123 })
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(2);
        expect(res.body.message[0]).toBe(percentageStringErrorMsg);
        expect(res.body.message[1]).toBe('juros must be a string');
      });
  });

  it(`Error: duplicate 'nome' for new categoria`, () => {
    return request(app.getHttpServer())
      .post('/categoria')
      .send(CategoriaInformaticaStub)
      .expect(500)
      .then((res) => {
        expect(res.body.message).toBe(
          'MongoServerError: E11000 duplicate key error collection: test.categorias index: nome_1 dup key: { nome: "Informática" }',
        );
      });
  });

  it(`Get created categoria`, () => {
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

  it(`Get all categorias`, () => {
    return request(app.getHttpServer())
      .get(`/categoria`)
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(2);
        expect(res.body[0]._id).toBe(newCategoria._id);
        expect(res.body[0].nome).toBe(CategoriaInformaticaStub.nome);
        expect(res.body[1]._id).toBeDefined();
        expect(res.body[1].nome).toBe(CategoriaAutomotivoStub.nome);
      });
  });

  it(`Get all categorias with pagination`, () => {
    return request(app.getHttpServer())
      .get(`/categoria`)
      .query({ size: 1, page: 1 })
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBeDefined();
        expect(res.body[0].nome).toBe(CategoriaAutomotivoStub.nome);
      });
  });

  it(`Error: invalid params for get all categorias`, () => {
    return request(app.getHttpServer())
      .get(`/categoria`)
      .query({ size: 'foo', page: 'bar' })
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(5);
        expect(res.body.error).toBe('Bad Request');
        expect(res.body.statusCode).toBe(400);
      });
  });

  it(`Update categoria`, async () => {
    await request(app.getHttpServer())
      .patch(`/categoria/${newCategoria._id}`)
      .send({ nome: newNomeCategoria, juros: '45.5' })
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newCategoria._id);
        expect(res.body.nome).toBe(newNomeCategoria);
      });

    return request(app.getHttpServer())
      .get(`/categoria/${newCategoria._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newCategoria._id);
        expect(res.body.nome).toBe(newNomeCategoria);
      });
  });

  it(`Error: invalid 'nome' for updated categoria`, () => {
    return request(app.getHttpServer())
      .patch(`/categoria/${newCategoria._id}`)
      .send({ nome: 123, juros: '10' })
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(1);
        expect(res.body.message[0]).toBe('nome must be a string');
      });
  });

  it(`Error: invalid 'juros' for updated categoria`, () => {
    return request(app.getHttpServer())
      .patch(`/categoria/${newCategoria._id}`)
      .send({ nome: 'foobar', juros: 123 })
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(2);
        expect(res.body.message[0]).toBe(percentageStringErrorMsg);
        expect(res.body.message[1]).toBe('juros must be a string');
      });
  });

  it(`Error: duplicate 'nome' for updated categoria`, () => {
    return request(app.getHttpServer())
      .patch(`/categoria/${newCategoria._id}`)
      .send(CategoriaAutomotivoStub)
      .expect(500)
      .then((res) => {
        expect(res.body.message).toBe(
          'MongoServerError: Plan executor error during findAndModify :: caused by :: E11000 duplicate key error collection: test.categorias index: nome_1 dup key: { nome: "Automotivo" }',
        );
      });
  });

  it(`Delete categoria`, async () => {
    return request(app.getHttpServer())
      .delete(`/categoria/${newCategoria._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newCategoria._id);
        expect(res.body.nome).toBe(newNomeCategoria);
      });
  });

  it(`Deleted categoria can't be found anymore`, async () => {
    await request(app.getHttpServer())
      .get(`/categoria/${newCategoria._id}`)
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Categoria not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });

    await request(app.getHttpServer())
      .patch(`/categoria/${newCategoria._id}`)
      .send({ nome: newNomeCategoria })
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Categoria not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });

    return request(app.getHttpServer())
      .delete(`/categoria/${newCategoria._id}`)
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Categoria not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });
  });

  afterAll(async () => {
    await app.close();
    await closeMongodConnection();
  });
});
