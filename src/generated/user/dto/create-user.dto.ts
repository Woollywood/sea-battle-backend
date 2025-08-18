import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({
    minimum: 3,
    minLength: 3,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  username: string
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  email: string
  @ApiProperty({
    minimum: 5,
    minLength: 5,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  password: string
}
