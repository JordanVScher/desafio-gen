import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CategoriaModule } from './categoria.module';
import { INestApplication } from '@nestjs/common';

describe('Root', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CategoriaModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('POST /categoria', () => {
    it(`create new categoria`, () => {
      return request(app.getHttpServer())
        .post('/categoria')
        .send({ nome: 'Informatica' })
        .expect(201)
        .then((res) => {
          expect(res.text).toBe('This action adds a new categoria');
        });
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
