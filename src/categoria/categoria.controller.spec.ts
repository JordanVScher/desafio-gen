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

  it(`Error: no 'nome' for new categoria`, () => {
    return request(app.getHttpServer())
      .post('/categoria')
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.message[0]).toBe('nome must be a string');
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
      .send({ nome: newNomeCategoria })
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

  it(`Error: no 'nome' for updated categoria`, () => {
    return request(app.getHttpServer())
      .patch(`/categoria/${newCategoria._id}`)
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.message[0]).toBe('nome must be a string');
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

    await request(app.getHttpServer())
      .delete(`/categoria/${newCategoria._id}`)
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Categoria not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });

    return request(app.getHttpServer())
      .get(`/categoria`)
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBeDefined();
        expect(res.body[0].nome).toBe(CategoriaAutomotivoStub.nome);
      });
  });

  afterAll(async () => {
    await app.close();
    await closeMongodConnection();
  });
});
