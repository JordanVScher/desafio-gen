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
import {
  CategoriaAutomotivoStub,
  CategoriaInformaticaStub,
} from '../../test/test-utils/stubs/categoriaStub';
import { Categoria, CategoriaSchema } from '../categoria/categoria.schema';
import { CategoriaController } from '../categoria/categoria.controller';
import { CategoriaService } from '../categoria/categoria.service';

describe('ProdutoController', () => {
  let app: INestApplication;
  let categoriaService: CategoriaService;

  let pNotebook;
  let pNotebookId;
  let pInvalidValor;
  let pFusca;
  let pFuscaId;
  let automovelCategoriaId;

  beforeAll(async () => {
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
      controllers: [ProdutoController, CategoriaController],
      providers: [ProdutoService, CategoriaService],
    }).compile();

    app = module.createNestApplication();

    await app.useGlobalPipes(new ValidationPipe());
    await app.useGlobalFilters(new MongoExceptionFilter());
    await app.useGlobalFilters(new MongoServerExceptionFilter());

    await app.init();

    // Create Categorias
    categoriaService = module.get<CategoriaService>(CategoriaService);

    const informaticaCategoria: any = await categoriaService.create(
      CategoriaInformaticaStub,
    );

    const automovelCategoria: any = await categoriaService.create(
      CategoriaAutomotivoStub,
    );

    pNotebook = ProdutoNotebookStub(informaticaCategoria._id);
    pInvalidValor = InvalidValorStub(informaticaCategoria._id);
    pFusca = ProdutoFuscaStub(automovelCategoria._id);
    automovelCategoriaId = automovelCategoria._id;
  });

  it(`Create new produto`, async () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(pNotebook)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.nome).toBe(pNotebook.nome);
        expect(res.body.descricao).toBe(pNotebook.descricao);
        expect(res.body.valor).toBe(pNotebook.valor);
        expect(res.body.idCategoria.toString()).toBe(
          pNotebook.idCategoria.toString(),
        );

        pNotebookId = res.body._id;
      });
  });

  it(`Create another produto`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(pFusca)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.nome).toBe(pFusca.nome);
        expect(res.body.descricao).toBe(pFusca.descricao);
        expect(res.body.valor).toBe(pFusca.valor);
        expect(res.body.idCategoria.toString()).toBe(
          pFusca.idCategoria.toString(),
        );

        pFuscaId = res.body._id;
      });
  });

  it(`Error: Invalid valor on create`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(pInvalidValor)
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
        expect(res.body.message.length).toBe(5);
      });
  });

  it(`Error: duplicate 'nome' for new produto`, () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(pFusca)
      .expect(500)
      .then((res) => {
        expect(res.body.message).toBe(
          'MongoServerError: E11000 duplicate key error collection: test.produtos index: nome_1 dup key: { nome: "Fusca" }',
        );
      });
  });

  it(`Get created produto`, () => {
    return request(app.getHttpServer())
      .get(`/produto/${pNotebookId}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.nome).toBe(pNotebook.nome);
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
        expect(res.body[0]._id).toBe(pNotebookId);
        expect(res.body[0].nome).toBe(pNotebook.nome);
        expect(res.body[1]._id).toBe(pFuscaId);
        expect(res.body[1].nome).toBe(pFusca.nome);
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
        expect(res.body[0].nome).toBe(pFusca.nome);
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
      .patch(`/produto/${pNotebookId}`)
      .send({ nome: newNomeProduto })
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(pNotebookId);
        expect(res.body.nome).toBe(newNomeProduto);
        expect(res.body.descricao).toBe(pNotebook.descricao);
        expect(res.body.valor).toBe(pNotebook.valor);
        expect(res.body.idCategoria.toString()).toBe(
          pNotebook.idCategoria.toString(),
        );
      });

    return request(app.getHttpServer())
      .get(`/produto/${pNotebookId}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(pNotebookId);
        expect(res.body.nome).toBe(newNomeProduto);
        expect(res.body.descricao).toBe(pNotebook.descricao);
        expect(res.body.valor).toBe(pNotebook.valor);
        expect(res.body.idCategoria.toString()).toBe(
          pNotebook.idCategoria.toString(),
        );
      });
  });

  it(`Error: invalid data for updated produto`, () => {
    return request(app.getHttpServer())
      .patch(`/produto/${pNotebookId}`)
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
      .patch(`/produto/${pNotebookId}`)
      .send({ nome: pFusca.nome })
      .expect(500)
      .then((res) => {
        expect(res.body.message).toBe(
          'MongoServerError: Plan executor error during findAndModify :: caused by :: E11000 duplicate key error collection: test.produtos index: nome_1 dup key: { nome: "Fusca" }',
        );
      });
  });

  it(`Delete produto`, async () => {
    return request(app.getHttpServer())
      .delete(`/produto/${pNotebookId}`)
      .expect(200)
      .then((res) => {
        expect(res.body._id).toBe(pNotebookId);
        expect(res.body.nome).toBe(newNomeProduto);
        expect(res.body.descricao).toBe(pNotebook.descricao);
        expect(res.body.valor).toBe(pNotebook.valor);
        expect(res.body.idCategoria.toString()).toBe(
          pNotebook.idCategoria.toString(),
        );
      });
  });

  it(`Deleted produto can't be found anymore`, async () => {
    await request(app.getHttpServer())
      .get(`/produto/${pNotebookId}`)
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Produto not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });

    await request(app.getHttpServer())
      .patch(`/produto/${pNotebookId}`)
      .send({ nome: newNomeProduto })
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Produto not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });

    await request(app.getHttpServer())
      .delete(`/produto/${pNotebookId}`)
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
        expect(res.body[0].nome).toBe(pFusca.nome);
        expect(res.body[0].descricao).toBe(pFusca.descricao);
        expect(res.body[0].valor).toBe(pFusca.valor);
        expect(res.body[0].idCategoria.toString()).toBe(
          pFusca.idCategoria.toString(),
        );
      });
  });

  it(`Error: Produto gets deleted when categoria gets deleted`, async () => {
    await categoriaService.remove(automovelCategoriaId);

    await request(app.getHttpServer())
      .get(`/produto/${pFuscaId}`)
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe('Produto not found');
        expect(res.body.error).toBe('Not Found');
        expect(res.body.statusCode).toBe(404);
      });
  });

  it(`Error: Produto can't be created if there's no valid category`, async () => {
    return request(app.getHttpServer())
      .post('/produto')
      .send(pFusca)
      .expect(400)
      .then((res) => {
        expect(res.body.message).toBe('Categoria does not exist');
        expect(res.body.error).toBe('Bad Request');
        expect(res.body.statusCode).toBe(400);
      });
  });

  it(`Error: Produto can't be updated if there's no valid category`, async () => {
    await request(app.getHttpServer())
      .post('/produto')
      .send(pNotebook)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
      });

    return request(app.getHttpServer())
      .patch(`/produto/${pNotebookId}`)
      .send({ idCategoria: automovelCategoriaId })
      .expect(400)
      .then((res) => {
        expect(res.body.message).toBe('Categoria does not exist');
        expect(res.body.error).toBe('Bad Request');
        expect(res.body.statusCode).toBe(400);
      });
  });

  afterAll(async () => {
    await closeMongodConnection();
  });
});
