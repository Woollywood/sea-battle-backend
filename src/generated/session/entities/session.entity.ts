import { ApiProperty } from '@nestjs/swagger'
import {
  User,
  type User as UserAsType,
} from '../../user/entities/user.entity'

export class Session {
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
    type: 'string',
  })
  accessToken: string
  @ApiProperty({
    type: 'string',
  })
  refreshToken: string
  @ApiProperty({
    type: () => User,
    required: false,
    nullable: true,
  })
  user?: UserAsType | null
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userId: string | null
}
