import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import env from './env';

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private logger = new Logger('DatabaseModule');

  constructor() {
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Connecting to database...');
      await this.prisma.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.logger.log('Disconnected from database');
    } catch (error) {
      this.logger.error('Error during disconnecting from database', error);
    }
  }

  get client(): PrismaClient {
    return this.prisma;
  }
}
