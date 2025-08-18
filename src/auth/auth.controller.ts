import type { Response } from 'express'

import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import queryString from 'query-string'
import { User as UserEntity } from 'src/generated/user/entities/user.entity'
import { UserService } from 'src/user/user.service'

import { AccessToken } from './decorators/access-token.decorator'
import { User } from './decorators/user.decorator'
import {
  JwtDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  TokensDto,
} from './dto/auth.dto'
import { GoogleGuard } from './guards/google.guard'
import { JwtGuard } from './guards/jwt.guard'
import { LocalAuthGuard } from './guards/local.guard'
import { RefreshGuard } from './guards/refresh.guard'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly UserService: UserService
  ) {}

  @ApiResponse({ status: 201, type: UserEntity })
  @Post('sign-up')
  signUp(@Body() createUser: SignUpDto) {
    return this.authService.signUp(createUser)
  }

  @ApiResponse({ status: 201, type: TokensDto })
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  signIn(
    @Body() { email }: SignInDto,
    @User() { sub, username }: JwtDto
  ): Promise<TokensDto> {
    return this.authService.signIn({ sub, username, email })
  }

  @ApiResponse({ status: 200 })
  @UseGuards(JwtGuard)
  @Post('sign-out')
  signOut(
    @User() { sub }: JwtDto,
    @AccessToken() accessToken: string
  ) {
    return this.authService.signOut(sub, accessToken)
  }

  @UseGuards(GoogleGuard)
  @Get('providers/google')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  googleProvider(@Query('redirectURL') redirectURL?: string) {}

  @UseGuards(GoogleGuard)
  @Get('google/callback')
  async googleCallback(
    @User() payload: JwtDto,
    @Res() res: Response,
    @Query('state') state: string
  ) {
    const json: string = Buffer.from(state, 'base64').toString(
      'utf-8'
    )
    const { redirectURL } = JSON.parse(json) as {
      redirectURL: string
    }
    const { accessToken, refreshToken } =
      await this.authService.signIn(payload)

    const redirectUrl = queryString.stringifyUrl({
      url: `${this.configService.get<string>('FRONTEND_URL')}/api/auth/providers/google/callback`,
      query: { accessToken, refreshToken, redirectURL },
    })
    res.redirect(redirectUrl)
  }

  @ApiResponse({ status: 201, type: TokensDto })
  @UseGuards(RefreshGuard)
  @Post('refresh')
  refreshToken(
    @Body() { refreshToken }: RefreshTokenDto,
    @User() { sub, username, email }: JwtDto
  ): Promise<TokensDto> {
    return this.authService.refreshToken(
      { sub, username, email },
      refreshToken
    )
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UserEntity })
  @UseGuards(JwtGuard)
  @Get('identity')
  identity(@User() { sub }: JwtDto) {
    return this.UserService.findById(sub)
  }
}
