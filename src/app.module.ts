import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrickTypesModule } from './brick-types/brick-types.module';
import { BrickType } from './brick-types/entities/brick-type.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5450'),
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || '123456',
                database: process.env.DB_NAME || 'psm-dev',
                migrations: [__dirname + '/migrations/*{.ts,.js}'],
                entities: [
                   BrickType
                ],
                synchronize: false, // Set to true to auto-create tables (development/staging only)
                migrationsRun: true // Set to true when initial db
            }),
    BrickTypesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
