import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

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
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  email?: string | null
}
