import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database.service';
import {
  SEED_PAYMENTS,
  SUM_TOTAL,
  cleanupByIds,
  cleanupUser,
  seedPayments,
  seedUser,
} from './payments-seed';
const AUTH_HEADER = `Bearer ${process.env.API_TOKEN ?? 'test-api-token'}`;

describe('Payments (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let seededIds: string[];
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api/v1');
    await app.init();

    const dbService = app.get(DatabaseService);
    prisma = dbService.client;

    const user = await seedUser(prisma);
    userId = user.id;

    await prisma.payment.deleteMany({ where: { userId } });
    const created = await seedPayments(prisma, userId);
    seededIds = created.map((p) => p.id);
  }, 30_000);

  afterAll(async () => {
    await cleanupUser(prisma, userId);
    await app.close();
  });

  describe('GET /api/v1/admin/payments', () => {
    it('should return all seeded payments', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/payments')
        .set('Authorization', AUTH_HEADER)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(SEED_PAYMENTS.length);
      expect(res.body.count).toBeGreaterThanOrEqual(SEED_PAYMENTS.length);
    });

    it('should filter by userId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/payments?userId=${userId}`)
        .set('Authorization', AUTH_HEADER)
        .expect(200);

      expect(res.body.data).toHaveLength(SEED_PAYMENTS.length);
      expect(res.body.data.every((p: any) => p.userId === userId)).toBe(true);
    });

    // it('should filter by date range', async () => {
    //   const res = await request(app.getHttpServer())
    //     .get('/api/v1/admin/payments?from=2025-01-01&to=2025-04-01')
    //     .set('Authorization', AUTH_HEADER)
    //     .expect(200);

    //   expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    //   expect(
    //     res.body.data.every(
    //       (p: any) =>
    //         new Date(p.paymentDate) >= new Date('2025-01-01') &&
    //         new Date(p.paymentDate) <= new Date('2025-03-31T23:59:59'),
    //     ),
    //   ).toBe(true);
    // });

    it('should paginate results', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/payments?take=2&skip=0')
        .set('Authorization', AUTH_HEADER)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
    });

    it('should paginate with skip', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/payments?take=2&skip=2')
        .set('Authorization', AUTH_HEADER)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
    });

    it('should return 401 without auth header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/payments')
        .expect(401);
    });
  });

  describe('GET /api/v1/admin/payments/:id', () => {
    it('should return a single payment by id', async () => {
      const id = seededIds[0];
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/payments/${id}`)
        .set('Authorization', AUTH_HEADER)
        .expect(200);

      expect(res.body.id).toBe(id);
      expect(Number(res.body.amount)).toBe(SEED_PAYMENTS[0].amount);
      expect(res.body.userId).toBe(userId);
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/payments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', AUTH_HEADER)
        .expect(404);
    });
  });

  describe('GET /api/v1/admin/payments/sum', () => {
    it('should return total sum of all payments', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/payments/sum')
        .set('Authorization', AUTH_HEADER)
        .expect(200);

      expect(Number(res.body.amount)).toBeGreaterThanOrEqual(SUM_TOTAL);
    });
  });

  describe('POST /api/v1/admin/payments', () => {
    it('should create a new payment', async () => {
      const dto = {
        userId,
        amount: 9999,
        monthsCount: 1,
        expiresOn: '2026-01-01T00:00:00.000Z',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/payments')
        .set('Authorization', AUTH_HEADER)
        .send(dto)
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(Number(res.body.amount)).toBe(dto.amount);
      expect(res.body.userId).toBe(dto.userId);
      expect(res.body.monthsCount).toBe(dto.monthsCount);

      await cleanupByIds(prisma, [res.body.id]);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/payments')
        .send({ userId, amount: 100, monthsCount: 1, expiresOn: '2026-01-01' })
        .expect(401);
    });
  });

  describe('PATCH /api/v1/admin/payments/:id', () => {
    it('should update an existing payment', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/admin/payments')
        .set('Authorization', AUTH_HEADER)
        .send({
          userId,
          amount: 1111,
          monthsCount: 1,
          expiresOn: '2025-09-01T00:00:00.000Z',
        })
        .expect(201);

      const id = createRes.body.id;

      const patchRes = await request(app.getHttpServer())
        .patch(`/api/v1/admin/payments/${id}`)
        .set('Authorization', AUTH_HEADER)
        .send({ amount: 2222 })
        .expect(200);

      expect(Number(patchRes.body.amount)).toBe(2222);
      expect(patchRes.body.userId).toBe(userId);

      await cleanupByIds(prisma, [id]);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/payments/${seededIds[0]}`)
        .send({ amount: 1 })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/admin/payments/:id', () => {
    it('should delete a payment', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/admin/payments')
        .set('Authorization', AUTH_HEADER)
        .send({
          userId,
          amount: 5555,
          monthsCount: 1,
          expiresOn: '2025-10-01T00:00:00.000Z',
        })
        .expect(201);

      const id = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/payments/${id}`)
        .set('Authorization', AUTH_HEADER)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/admin/payments/${id}`)
        .set('Authorization', AUTH_HEADER)
        .expect(404);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/payments/${seededIds[0]}`)
        .expect(401);
    });
  });
});
