import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
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
    nullable: true,
  })
  @IsOptional()
  @IsString()
  email?: string | null
}
