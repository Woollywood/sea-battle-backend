import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AuthService } from '../auth.service'
import { JwtDto } from '../dto/auth.dto'

@Injectable()
export class RefreshStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt'
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ?? '',
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtDto) {
    return this.authService.validateRefreshToken(
      payload,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      req.body.refreshToken || ''
    )
  }
}
