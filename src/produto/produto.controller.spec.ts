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
  ProdutoFuscaStub,
  ProdutoNotebookStub,
  newNomeProduto,
} from '../../test/test-utils/stubs/produtoStub';

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

    await app.useGlobalFilters(new MongoExceptionFilter());
    await app.useGlobalPipes(new ValidationPipe());

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
      });
  });

  it(`Error: no data for new produto`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.message.length).toBe(3);
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

  it(`Update categoria`, async () => {
    await request(app.getHttpServer())
      .patch(`/produto/${newProduto._id}`)
      .send({ nome: newNomeProduto })
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newProduto._id);
        expect(res.body.nome).toBe(newNomeProduto);
      });

    return request(app.getHttpServer())
      .get(`/produto/${newProduto._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newProduto._id);
        expect(res.body.nome).toBe(newNomeProduto);
      });
  });

  it(`Error: invalid data for updated produto`, () => {
    return request(app.getHttpServer())
      .patch(`/produto/${newProduto._id}`)
      .send({ nome: 123 })
      .expect(400)
      .then((res) => {
        expect(res.body.message[0]).toBe('nome must be a string');
      });
  });

  it(`Delete produto`, async () => {
    return request(app.getHttpServer())
      .delete(`/produto/${newProduto._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(newProduto._id);
        expect(res.body.nome).toBe(newNomeProduto);
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

    return request(app.getHttpServer())
      .delete(`/produto/${newProduto._id}`)
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Produto not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });
  });

  afterAll(async () => {
    await closeMongodConnection();
  });
});
