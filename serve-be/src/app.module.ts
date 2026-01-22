import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthsModuleModule } from './auths-module/auths-module.module';
import { MarketplaceModuleModule } from './marketplace-module/marketplace-module.module';
import { PaymentModuleModule } from './payment-module/payment-module.module';
import { CommunityModuleModule } from './community-module/community-module.module';
import { ChatModuleModule } from './chat-module/chat-module.module';
import { AiModuleModule } from './ai-module/ai-module.module';
import { AcademicModuleModule } from './academic-module/academic-module.module';
import { NotificationModuleModule } from './notification-module/notification-module.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtAuthGuard } from './auths-module/jwt.auth-module.guard';
import { RoleGuard } from './auths-module/auths-module.guard';
import { ValidationPipe } from '@nestjs/common';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('DB_SYNC', true),
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'img'),
      serveRoot: '/img',
    }),
    AuthsModuleModule,
    MarketplaceModuleModule,
    PaymentModuleModule,
    CommunityModuleModule,
    ChatModuleModule,
    AiModuleModule,
    AcademicModuleModule,
    NotificationModuleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
