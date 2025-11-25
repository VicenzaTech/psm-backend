import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrickTypeModule } from './brick-type/brick-type.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { BullModule } from '@nestjs/bullmq';
import { ActivityLogQueueModule } from './common/queue/activity-log.queue/activity-log.queue';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
        }),
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: {
                    host: config.get<string>('REDIS_HOST', 'localhost'),
                    port: config.get<number>('REDIS_PORT', 6379),
                    password: config.get<string>('REDIS_PASSWORD') || undefined,
                },
            }),
        }),
        BrickTypeModule,
        PrismaModule,
        AuthModule,
        ActivityLogModule,
        ActivityLogQueueModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
