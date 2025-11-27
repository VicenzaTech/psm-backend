import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IJWTPayload } from './auth.constant';
import { User } from '@prisma/client';
import { CreateSessionDTO } from 'src/session/dto/create-session-dto';
import { LoginDTO } from './dto/dto.login-dto';
import ms from 'ms';
import { HASH_PROVIDER, Hasher } from 'src/common/hash/hash.constant';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { OkResponse } from 'src/common/type/response.type';
import { ActivityEntityType } from 'src/activity-log/activity-log.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    @Inject(HASH_PROVIDER) private readonly hasher: Hasher,
  ) {}

  async me(user: User) {
    const { roles, permissions } =
      await this.userService.findUserRolesAndPermissions(user.id);
    return {
      user: {
        email: user?.email,
        username: user?.username,
        id: user?.id,
        roles,
        permissions,
      },
    };
  }

  async login(loginDTO: LoginDTO) {
    const { identifier, password } = loginDTO;
    const isEmail = identifier.includes('@');
    const expired = this.configService.get('JWT_REFRESH_EXPIRES');
    const expiredMs = Number(ms(expired));

    const lowerIdentifier = identifier.toLowerCase();
    const foundUser = await (isEmail
      ? this.userService.findOneByEmail(lowerIdentifier)
      : this.userService.findOneByUsername(lowerIdentifier));

    if (!foundUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.hasher.compare(
      password,
      foundUser.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!foundUser.isActive) {
      throw new ForbiddenException('Account is not active');
    }

    const payload: IJWTPayload = {
      email: foundUser.email,
      username: foundUser.username,
      id: foundUser.id,
    };

    const tokens = await this.generateTokenPair(payload);

    const sessionPayload: CreateSessionDTO = {
      ip: '127.0.0.1',
      refreshToken: tokens.refreshtoken,
      ttlSeconds: expiredMs,
      userAgent: 'dev',
      userId: foundUser.id,
    };

    const newSession = await this.sessionService.createSession(sessionPayload);
    if (!newSession) {
      throw new ForbiddenException('Failed to create session');
    }

    const { roles, permissions } =
      await this.userService.findUserRolesAndPermissions(foundUser.id);

    return {
      data: {
        tokens,
        user: {
          ...payload,
          roles,
          permissions,
        },
        sessionId: newSession.sessionId,
      },
      log: {
        action: 'LOGIN_SUCCESS',
        actionType: 'LOGIN_SUCCESS',
        description: `Người dùng ${payload?.username ?? '...'} đã đăng nhập thành công`,
        entityType: ActivityEntityType.User,
      },
    } as OkResponse;
  }

  async logout(user, sessionId: string) {
    await this.sessionService.revokeSession(sessionId);
    return {
      data: sessionId,
      log: {
        action: 'LOGOUT',
        actionType: 'LOGOUT',
        description: `Người dùng ${user?.username ?? '...'} đã đăng xuất`,
        entityType: ActivityEntityType.User,
      },
    } as OkResponse;
  }

  async refresh(user: User, refreshToken: string, sessionId: string) {
    if (!user || !refreshToken || !sessionId) {
      throw new UnauthorizedException();
    }

    const payload: IJWTPayload = {
      email: user.email,
      id: user.id,
      username: user.username,
    };

    const tokens = await this.generateTokenPair(payload);
    const { roles, permissions } =
      await this.userService.findUserRolesAndPermissions(user.id);

    const updatedSession = await this.sessionService.updateRefreshToken(
      sessionId,
      tokens.refreshtoken,
    );
    if (!updatedSession) {
      throw new UnauthorizedException('Session has expired');
    }

    return {
      tokens,
      user: {
        ...payload,
        roles,
        permissions,
      },
      sessionId,
    };
  }

  async generateTokenPair(payload: IJWTPayload) {
    const JWT_ACCESS_SECRET =
      this.configService.get<string>('JWT_ACCESS_SECRET');
    const JWT_ACCESS_EXPIRES = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES',
    ) as any;
    const JWT_REFRESH_SECRET =
      this.configService.get<string>('JWT_REFRESH_SECRET');
    const JWT_REFRESH_EXPIRES = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES',
    ) as any;

    const accessToken = await this.jwtService.sign(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: JWT_ACCESS_EXPIRES ?? '15m',
    });

    const refreshtoken = this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_EXPIRES ?? '15m',
    });

    return { accessToken, refreshtoken };
  }
}
