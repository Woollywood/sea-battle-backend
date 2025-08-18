import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { getAccessTokenFromHeader } from 'src/utils'

import { AuthService } from '../auth.service'
import { JwtDto } from '../dto/auth.dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ?? '',
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtDto) {
    return this.authService.validateJwtUser(
      payload,
      getAccessTokenFromHeader(req.headers.authorization || '')
    )
  }
}
