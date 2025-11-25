import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import ms from 'ms'
import { LoginDTO } from './dto/dto.login-dto';
import { COOKIE_KEY } from './auth.constant';
import { AuthGuard } from './guard/auth/auth.guard'
import type { Response } from 'express';
import { SessionGuard } from './guard/session/session.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Post('/login')
    async login(@Body() loginDto: LoginDTO, @Res({ passthrough: true }) res: Response) {
        const expired = this.configService.get('JWT_REFRESH_EXPIRES')
        const expired_ms = Number((ms(expired)))
        const loginData = await this.authService.login(loginDto)
        res.cookie(COOKIE_KEY.REFRESH_TOKEN_KEY, loginData.data.tokens.refreshtoken, {
            httpOnly: true,
            secure: true,
            maxAge: expired_ms
        })
        res.cookie(COOKIE_KEY.SESSION_ID_KEY, loginData.data.sessionId, {
            httpOnly: true,
            secure: true,
            maxAge: expired_ms
        })
        return loginData
    }

    @Post('/logout')
    @UseGuards(SessionGuard)
    async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
        // 2. force logout if expired token
        const sessionId = req.sessionId
        const user = req.user
        const logoutData = await this.authService.logout(user, sessionId)
        res.clearCookie(COOKIE_KEY.REFRESH_TOKEN_KEY, {
            httpOnly: true,
        })
        res.clearCookie(COOKIE_KEY.SESSION_ID_KEY, {
            httpOnly: true,
        })
        return logoutData
    }

    @Post('/refresh')
    @UseGuards(SessionGuard)
    async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
        const user = req.user
        const sessionId = req.sessionId
        const refreshToken = req.refreshToken

        const expired = this.configService.get('JWT_REFRESH_EXPIRES')
        const refreshData = await this.authService.refresh(user, refreshToken, sessionId)
        const expired_ms = Number((ms(expired)))
        res.cookie(COOKIE_KEY.REFRESH_TOKEN_KEY, refreshData.tokens.refreshtoken, {
            httpOnly: true,
            secure: true,
            maxAge: expired_ms
        })
        res.cookie(COOKIE_KEY.SESSION_ID_KEY, refreshData.sessionId, {
            httpOnly: true,
            secure: true,
            maxAge: expired_ms
        })

        return refreshData
    }

    @Get('/me')
    @UseGuards(AuthGuard)
    async me(@Req() req) {
        const user = req.user
        return await this.authService.me(user)
    }
}
