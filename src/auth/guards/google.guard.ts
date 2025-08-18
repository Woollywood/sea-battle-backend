import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport'
import { Request } from 'express'

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  constructor() {
    super({ accessType: 'offline' })
  }

  getAuthenticateOptions(
    context: ExecutionContext
  ): IAuthModuleOptions | undefined {
    const req = context.switchToHttp().getRequest<Request>()
    const redirectURL = req.query['redirectURL']
    const json: string = JSON.stringify({ redirectURL })
    const state: string = Buffer.from(json, 'utf-8').toString(
      'base64'
    )
    return { state }
  }
}
