import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductionBackendService } from './production-backend.service';

@Module({
    imports: [ConfigModule],
    providers: [ProductionBackendService],
    exports: [ProductionBackendService],
})
export class ProductionBackendModule { }

