import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
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
    @Body() body: SignInDto,
    @User() { sub, username }: JwtDto
  ): Promise<TokensDto> {
    return this.authService.signIn({ sub, username })
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

  @ApiResponse({ status: 201, type: TokensDto })
  @UseGuards(RefreshGuard)
  @Post('refresh')
  refreshToken(
    @Body() { refreshToken }: RefreshTokenDto,
    @User() { sub, username }: JwtDto
  ): Promise<TokensDto> {
    return this.authService.refreshToken(
      { sub, username },
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
