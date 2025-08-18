import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class ConnectUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string
  @ApiProperty({
    minimum: 3,
    minLength: 3,
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string
}
