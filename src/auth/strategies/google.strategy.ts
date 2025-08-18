import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'

import { AuthService } from '../auth.service'
import { GoogleProfile } from '../auth.types'
import { JwtDto } from '../dto/auth.dto'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') ?? '',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ?? '',
      scope: ['email', 'profile'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback
  ) {
    const { id, username, email } =
      await this.authService.validateGoogleUser({
        email: profile.emails[0].value,
        username: profile.displayName,
        password: '',
      })

    done(null, { sub: id, username, email } as JwtDto)
  }
}
