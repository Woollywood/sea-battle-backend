import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { SessionService } from 'src/session/session.service'
import { UserService } from 'src/user/user.service'

import { JwtDto, SignUpDto, TokensDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService
  ) {}

  private generateTokens(payload: JwtDto) {
    return Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN'
        ),
      }),
    ])
  }

  async validateUser(username: string): Promise<JwtDto> {
    const user = await this.userService.findByUsername(username)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return {
      sub: user.id,
      username: user.username,
    }
  }

  async validateJwtUser(
    { sub, ...rest }: JwtDto,
    accessToken: string
  ) {
    const user = await this.userService.findById(sub)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const session = await this.sessionService.invalidateSessionToken(
      user.id,
      accessToken,
      'accessToken'
    )

    if (!session) {
      throw new UnauthorizedException('invalid token')
    }

    return { sub, ...rest }
  }

  async validateRefreshToken(
    { sub, ...rest }: JwtDto,
    refreshToken: string
  ) {
    const user = await this.userService.findById(sub)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const session = await this.sessionService.invalidateSessionToken(
      user.id,
      refreshToken,
      'refreshToken'
    )

    if (!session) {
      throw new UnauthorizedException('invalid token')
    }

    return { sub, ...rest }
  }

  async signUp(createdUserDto: SignUpDto) {
    const isUsernameExists = await this.userService.findByUsername(
      createdUserDto.username
    )
    if (isUsernameExists) {
      throw new BadRequestException('This username is already taken')
    }

    return this.userService.createUser(createdUserDto)
  }

  async signIn(payload: JwtDto): Promise<TokensDto> {
    const [accessToken, refreshToken] =
      await this.generateTokens(payload)
    await this.sessionService.createSession(payload.sub, {
      accessToken,
      refreshToken,
    })
    return { accessToken, refreshToken }
  }

  async signOut(userId: string, accessToken: string) {
    const session = await this.sessionService.invalidateSessionToken(
      userId,
      accessToken,
      'accessToken'
    )
    if (!session) {
      throw new UnauthorizedException('invalid token')
    }

    const { id } = await this.sessionService.findSessionByToken(
      userId,
      accessToken,
      'accessToken'
    )
    await this.sessionService.revokeSession(id)
  }

  async refreshToken(
    payload: JwtDto,
    refreshToken: string
  ): Promise<TokensDto> {
    console.log('refresh')

    const hasSession =
      await this.sessionService.invalidateSessionToken(
        payload.sub,
        refreshToken,
        'refreshToken'
      )

    if (!hasSession) {
      throw new UnauthorizedException('invalid token')
    }

    const [newAccessToken, newRefreshToken] =
      await this.generateTokens(payload)
    const session = await this.sessionService.findSessionByToken(
      payload.sub,
      refreshToken,
      'refreshToken'
    )

    await this.sessionService.updateSessionTokensById(session.id, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }
}
