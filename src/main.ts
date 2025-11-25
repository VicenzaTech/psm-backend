import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApplicationLogger } from './common/logger/logger';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ResponseFormatInterceptor } from './common/interceptor/response-format/response-format.interceptor';
import { ActivityLogProviderService } from './common/queue/activity-log.queue/activity-log.provider';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('/api')
    const config = app.get(ConfigService);
    const activityLogProviderService = app.get(ActivityLogProviderService)
    const port = config.get<number>('app.port', { infer: true });
    // Use common
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // strip properties without decorators
            forbidNonWhitelisted: true, // throw when extra fields provided
            transform: true, // auto-transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.useGlobalInterceptors(new ResponseFormatInterceptor(activityLogProviderService))
    // Use middleware
    app.use(compression());
    app.use(cookieParser());
    // Initial Logger
    app.useLogger(new ApplicationLogger());

    // Initial Validation Pipe

    // Interceptor
    await app.listen(6667);
}
bootstrap();
