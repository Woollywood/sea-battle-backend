import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateSessionDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  accessToken: string
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string
}
