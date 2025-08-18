import { Session } from 'src/generated/session/entities/session.entity'

export type SessionTokenType = keyof Pick<
  Session,
  'accessToken' | 'refreshToken'
>
