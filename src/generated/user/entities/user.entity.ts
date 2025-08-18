import { ApiProperty } from '@nestjs/swagger'
import {
  Session,
  type Session as SessionAsType,
} from '../../session/entities/session.entity'

export class User {
  @ApiProperty({
    type: 'string',
  })
  id: string
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date
  @ApiProperty({
    minimum: 3,
    minLength: 3,
    type: 'string',
  })
  username: string
  @ApiProperty({
    type: 'string',
  })
  email: string
  @ApiProperty({
    minimum: 5,
    minLength: 5,
    type: 'string',
  })
  password: string
  @ApiProperty({
    type: () => Session,
    isArray: true,
    required: false,
  })
  sessions?: SessionAsType[]
}
