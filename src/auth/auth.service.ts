import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { CreateUserDto } from 'src/generated/user/dto/create-user.dto'
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

  private async createUser(dto: SignUpDto) {
    const user = await this.userService.createUser(dto)
    return user
  }

  async validateGoogleUser(googleUser: SignUpDto) {
    const user = await this.userService.findByEmail(googleUser.email)

    if (user) {
      return user
    }

    return this.createUser(googleUser)
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<JwtDto> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const isPasswordCorrect = await this.userService.comparePassword(
      user.password,
      password
    )

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password')
    }

    return {
      sub: user.id,
      username: user.username,
      email: user.email,
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

  async signUp(createdUserDto: CreateUserDto) {
    const isUsernameExists = await this.userService.findByUsername(
      createdUserDto.username
    )
    if (isUsernameExists) {
      throw new BadRequestException('This username is already taken')
    }

    const isEmailExists = await this.userService.findByEmail(
      createdUserDto.email
    )
    if (isEmailExists) {
      throw new BadRequestException('This email is already taken')
    }

    return this.createUser(createdUserDto)
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
