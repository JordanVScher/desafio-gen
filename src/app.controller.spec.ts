import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { INestApplication } from '@nestjs/common';

describe('Root', () => {
  let app: INestApplication;
  const appService = {
    getHealth: () => ({ status: 'OK', message: 'Service is up and running' }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(appService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`GET /health`, () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect(appService.getHealth());
  });

  afterAll(async () => {
    await app.close();
  });
});
