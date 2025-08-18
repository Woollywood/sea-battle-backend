import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator'

export class JwtDto {
  @ApiProperty()
  @IsUUID()
  sub: string

  @ApiProperty()
  @IsString()
  @MinLength(3)
  username: string

  @ApiProperty()
  @IsEmail()
  email: string
}

export class TokensDto {
  @ApiProperty()
  @IsString()
  accessToken: string

  @ApiProperty()
  @IsString()
  refreshToken: string
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string
}

export class SignUpDto {
  @ApiProperty({
    minimum: 3,
    minLength: 3,
    type: 'string',
  })
  @IsNotEmpty()
  @MinLength(3)
  @IsString()
  username: string

  @ApiProperty({
    minimum: 5,
    minLength: 5,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  password: string

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string
}

export class SignInDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @MinLength(5)
  password: string
}
