import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';
import {
  closeMongodConnection,
  rootMongooseTestModule,
} from '../../test/test-utils/mongo/MongooseTestModule';
import { MongooseModule } from '@nestjs/mongoose';
import { Produto, ProdutoSchema } from './produto.schema';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongoExceptionFilter } from '../filters/MongoExceptionFilter';
import {
  InvalidValorStub,
  ProdutoFuscaStub,
  ProdutoNotebookStub,
  newNomeProduto,
} from '../../test/test-utils/stubs/produtoStub';
import { monetaryStringErrorMsg } from '../utils/monetary-regex';
import { MongoServerExceptionFilter } from '../filters/MongoServerExceptionFilter';

describe('ProdutoController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Produto.name, schema: ProdutoSchema },
        ]),
      ],
      controllers: [ProdutoController],
      providers: [ProdutoService],
    }).compile();

    app = module.createNestApplication();

    await app.useGlobalPipes(new ValidationPipe());
    await app.useGlobalFilters(new MongoExceptionFilter());
    await app.useGlobalFilters(new MongoServerExceptionFilter());

    await app.init();
  });

  let newProduto;

  it(`Create new produto`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(ProdutoNotebookStub)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.nome).toBe(ProdutoNotebookStub.nome);
        expect(res.body.descricao).toBe(ProdutoNotebookStub.descricao);
        expect(res.body.valor).toBe(ProdutoNotebookStub.valor);
        newProduto = res.body;
      });
  });

  it(`Create another produto`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(ProdutoFuscaStub)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.nome).toBe(ProdutoFuscaStub.nome);
        expect(res.body.descricao).toBe(ProdutoFuscaStub.descricao);
        expect(res.body.valor).toBe(ProdutoFuscaStub.valor);
      });
  });

  it(`Error: Invalid valor on create`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(InvalidValorStub)
      .expect(400)
      .then((res) => {
        expect(res.body.message[0]).toBe(monetaryStringErrorMsg);
      });
  });

  it(`Error: no data for new produto`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(4);
      });
  });

  it(`Error: duplicate 'nome' for new produto`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(ProdutoFuscaStub)
      .expect(500)
      .then((res) => {
        expect(res.body.message).toBe(
          'MongoServerError: E11000 duplicate key error collection: test.produtos index: nome_1 dup key: { nome: "Fusca" }',
        );
      });
  });

  it(`Get created produto`, () => {
    return request(app.getHttpServer())
      .get(`/produto/${newProduto._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.nome).toBe(newProduto.nome);
      });
  });

  it(`Error: invalid id`, () => {
    return request(app.getHttpServer())
      .get(`/produto/foobar`)
      .expect(500)
      .then((res) => {
        expect(res.body.message).toBe(
          'CastError: Cast to ObjectId failed for value "foobar" (type string) at path "_id" for model "Produto"',
        );
      });
  });

  it(`Get all produtos`, () => {
    return request(app.getHttpServer())
      .get(`/produto`)
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(2);
        expect(res.body[0]._id).toBe(newProduto._id);
        expect(res.body[0].nome).toBe(ProdutoNotebookStub.nome);
        expect(res.body[0].descricao).toBe(ProdutoNotebookStub.descricao);
        expect(res.body[0].valor).toBe(ProdutoNotebookStub.valor);
        expect(res.body[1]._id).toBeDefined();
        expect(res.body[1].nome).toBe(ProdutoFuscaStub.nome);
        expect(res.body[1].descricao).toBe(ProdutoFuscaStub.descricao);
        expect(res.body[1].valor).toBe(ProdutoFuscaStub.valor);
      });
  });

  it(`Get all produtos with pagination`, () => {
    return request(app.getHttpServer())
      .get(`/produto`)
      .query({ size: 1, page: 1 })
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBeDefined();
        expect(res.body[0].nome).toBe(ProdutoFuscaStub.nome);
        expect(res.body[0].descricao).toBe(ProdutoFuscaStub.descricao);
        expect(res.body[0].valor).toBe(ProdutoFuscaStub.valor);
      });
  });

  it(`Error: invalid params for get all produtos`, () => {
    return request(app.getHttpServer())
      .get(`/produto`)
      .query({ size: 'foo', page: 'bar' })
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(5);
        expect(res.body.error).toBe('Bad Request');
        expect(res.body.statusCode).toBe(400);
      });
  });

  it(`Update produto`, async () => {
    await request(app.getHttpServer())
      .patch(`/produto/${newProduto._id}`)
      .send({ nome: newNomeProduto })
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newProduto._id);
        expect(res.body.nome).toBe(newNomeProduto);
        expect(res.body.descricao).toBe(ProdutoNotebookStub.descricao);
        expect(res.body.valor).toBe(ProdutoNotebookStub.valor);
      });

    return request(app.getHttpServer())
      .get(`/produto/${newProduto._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newProduto._id);
        expect(res.body.nome).toBe(newNomeProduto);
        expect(res.body.descricao).toBe(ProdutoNotebookStub.descricao);
        expect(res.body.valor).toBe(ProdutoNotebookStub.valor);
      });
  });

  it(`Error: invalid data for updated produto`, () => {
    return request(app.getHttpServer())
      .patch(`/produto/${newProduto._id}`)
      .send({ nome: 123, valor: 'foobar' })
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(2);
        expect(res.body.message[0]).toBe('nome must be a string');
        expect(res.body.message[1]).toBe(monetaryStringErrorMsg);
      });
  });

  it(`Error: duplicate 'nome' for updated categoria`, () => {
    return request(app.getHttpServer())
      .patch(`/produto/${newProduto._id}`)
      .send(ProdutoFuscaStub)
      .expect(500)
      .then((res) => {
        expect(res.body.message).toBe(
          'MongoServerError: Plan executor error during findAndModify :: caused by :: E11000 duplicate key error collection: test.produtos index: nome_1 dup key: { nome: "Fusca" }',
        );
      });
  });

  it(`Delete produto`, async () => {
    return request(app.getHttpServer())
      .delete(`/produto/${newProduto._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newProduto._id);
        expect(res.body.nome).toBe(newNomeProduto);
        expect(res.body.descricao).toBe(ProdutoNotebookStub.descricao);
        expect(res.body.valor).toBe(ProdutoNotebookStub.valor);
      });
  });

  it(`Deleted produto can't be found anymore`, async () => {
    await request(app.getHttpServer())
      .get(`/produto/${newProduto._id}`)
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Produto not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });

    await request(app.getHttpServer())
      .patch(`/produto/${newProduto._id}`)
      .send({ nome: newNomeProduto })
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Produto not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });

    await request(app.getHttpServer())
      .delete(`/produto/${newProduto._id}`)
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Produto not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });

    return request(app.getHttpServer())
      .get(`/produto`)
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBeDefined();
        expect(res.body[0].nome).toBe(ProdutoFuscaStub.nome);
        expect(res.body[0].descricao).toBe(ProdutoFuscaStub.descricao);
        expect(res.body[0].valor).toBe(ProdutoFuscaStub.valor);
      });
  });

  afterAll(async () => {
    await closeMongodConnection();
  });
});
