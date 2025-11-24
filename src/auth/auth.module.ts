import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { SessionModule } from 'src/session/session.module';
import { HashModule } from 'src/common/hash/hash.module';
import { AuthGuard } from './guard/auth/auth.guard';

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    imports: [
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService): JwtModuleOptions => {
                const JWT_ACCESS_SECRET = configService.get<string>('JWT_ACCESS_SECRET');
                const JWT_ACCESS_EXPIRES = configService.get<string>('JWT_ACCESS_EXPIRES');

                return {
                    global: true,
                    secret: JWT_ACCESS_SECRET,
                    signOptions: {
                        expiresIn: JWT_ACCESS_EXPIRES as any,
                    },
                };
            },
            inject: [ConfigService],
        }),
        UserModule,
        SessionModule,
        HashModule,
        ConfigModule
    ],
    exports: [JwtModule, AuthService, AuthGuard, UserModule, SessionModule],
})
export class AuthModule { }
