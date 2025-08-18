import { ApiProperty } from '@nestjs/swagger'

export class SessionDto {
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
}
