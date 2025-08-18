import { BadRequestException, Injectable } from '@nestjs/common'
import { hash, verify } from 'argon2'
import { TokensDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma/prisma.service'

import { SessionTokenType } from './session.types'

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}

  private invalidateTokenToList(
    sessionsTokens: string[],
    tokenToInvalidate: string
  ) {
    return Promise.all(
      sessionsTokens.map(
        (value) =>
          new Promise<boolean>(
            (resolve) =>
              void verify(value, tokenToInvalidate).then(resolve)
          )
      )
    )
  }

  private async invalidateToken(
    sessionsTokens: string[],
    tokenToInvalidate: string
  ): Promise<boolean> {
    const results = await this.invalidateTokenToList(
      sessionsTokens,
      tokenToInvalidate
    )
    return results.some(Boolean)
  }

  async hashTokens({ accessToken, refreshToken }: TokensDto) {
    const [hashedAcessToken, hashedRefreshToken] = await Promise.all([
      hash(accessToken),
      hash(refreshToken),
    ])

    return { hashedAcessToken, hashedRefreshToken }
  }

  async createSession(userId: string, tokens: TokensDto) {
    const { hashedAcessToken, hashedRefreshToken } =
      await this.hashTokens(tokens)
    return this.prismaService.session.create({
      data: {
        accessToken: hashedAcessToken,
        refreshToken: hashedRefreshToken,
        user: { connect: { id: userId } },
      },
    })
  }

  async updateSessionTokensById(id: string, tokens: TokensDto) {
    const { hashedAcessToken, hashedRefreshToken } =
      await this.hashTokens(tokens)
    return this.prismaService.session.update({
      where: { id },
      data: {
        accessToken: hashedAcessToken,
        refreshToken: hashedRefreshToken,
      },
    })
  }

  revokeSession(id: string) {
    return this.prismaService.session.delete({ where: { id } })
  }

  async findSessionByToken(
    userId: string,
    token: string,
    tokenType: SessionTokenType
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { sessions: true },
    })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    const sessionsBoolList = await this.invalidateTokenToList(
      user.sessions.map((session) => session[tokenType]),
      token
    )
    const sessionIndex = sessionsBoolList.findIndex(Boolean)
    return user.sessions[sessionIndex]
  }

  async invalidateSessionToken(
    userId: string,
    token: string,
    tokenType: SessionTokenType
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { sessions: true },
    })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    return this.invalidateToken(
      user.sessions.map((session) => session[tokenType]),
      token
    )
  }
}
