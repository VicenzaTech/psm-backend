import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UserService } from '../../../user/user.service'
import { IJWTPayload } from '../../auth.constant'
import { Request } from 'express'
const UNAUTH_MESSAGE = 'Xác thực phiên đăng nhập thất bại'
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest<Request>();

        const authHeader =
            (request.headers['authorization'] as string | undefined) ??
            (request.headers['Authorization'] as string | undefined);

        if (!authHeader) {
            throw new UnauthorizedException(UNAUTH_MESSAGE);
        }

        const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
            throw new UnauthorizedException(UNAUTH_MESSAGE);
        }

        // Verify token
        const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
        let payload: IJWTPayload;

        try {
            payload = this.jwtService.verify<IJWTPayload>(token, { secret });
        } catch (error) {
            throw new UnauthorizedException(UNAUTH_MESSAGE);
        }
        const foundUser = await this.userService.findOne(payload.id);
        if (!foundUser) throw new UnauthorizedException(UNAUTH_MESSAGE);

        if (!foundUser.isActive) throw new UnauthorizedException(UNAUTH_MESSAGE);

        (request as any).user = foundUser;

        return true;
    }
}
