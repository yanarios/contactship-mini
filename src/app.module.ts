import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; 
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { BullModule } from '@nestjs/bull';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Lead } from './leads/lead.entity';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { LeadsAiService } from './leads/leads.ai.service';
import { LeadsProcessor } from './leads/leads.processor';

@Module({
  imports: [
    // Configuration & Environment Variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Cron Jobs Support
    ScheduleModule.forRoot(),

    // Caching Layer (Redis)
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      ttl: 60000, 
    }),

    // Background Queues (Bull + Redis)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    BullModule.registerQueue({
      name: 'leads-queue',
    }),

    // Database Connection (PostgreSQL)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),

    // Entity Registration
    TypeOrmModule.forFeature([Lead]),
  ],
  controllers: [AppController, LeadsController],
  providers: [AppService, LeadsService, LeadsAiService, LeadsProcessor], 
})
export class AppModule {}