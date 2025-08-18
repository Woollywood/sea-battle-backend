import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common'
import { Request } from 'express'
import { getAccessTokenFromHeader } from 'src/utils'

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    return getAccessTokenFromHeader(
      request.get('Authorization') ?? ''
    )
  }
)
