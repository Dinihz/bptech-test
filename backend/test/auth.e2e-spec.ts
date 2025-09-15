import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response as SupertestResponse } from 'supertest';
import type { Server } from 'http';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query('DELETE FROM reservations;');
    await dataSource.query('DELETE FROM users;');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should successfully complete the authentication flow', async () => {
    const userDto = {
      name: 'Test User E2E',
      email: 'teste2e@example.com',
      password: 'password123',
    };

    const server = app.getHttpServer() as unknown as Server;

    await request(server).get('/api/auth/profile').expect(401);

    await request(server).post('/api/users').send(userDto).expect(201);

    await request(server).post('/api/users').send(userDto).expect(409);

    const loginResponse: SupertestResponse = await request(server)
      .post('/api/auth/login')
      .send({ email: userDto.email, password: userDto.password })
      .expect(200);

    const { access_token: accessToken } = loginResponse.body as {
      access_token: string;
    };
    expect(accessToken).toBeDefined();

    const profileResponse: SupertestResponse = await request(server)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const profile = profileResponse.body as { email: string };
    expect(profile.email).toEqual(userDto.email);
  });
});
