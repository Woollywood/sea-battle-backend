import { Body, Controller, Post } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { AccessToken } from 'src/auth/decorators/access-token.decorator'

import { InvalidateTokenDto } from './dto/invalidate-token.dto'
import { InvalidateTokenResponse } from './types/invalidate-token.response'
import { SessionService } from './session.service'

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @ApiResponse({ status: 200, type: InvalidateTokenResponse })
  @Post('invalidate')
  async invalidate(
    @Body() { userId }: InvalidateTokenDto,
    @AccessToken() token: string
  ): Promise<InvalidateTokenResponse> {
    const isValid = await this.sessionService.invalidateSessionToken(
      userId,
      token,
      'accessToken'
    )
    return { isValid }
  }
}
