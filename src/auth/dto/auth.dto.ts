import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsString, IsUUID, MinLength } from 'class-validator'
import { CreateUserDto } from 'src/generated/user/dto/create-user.dto'

export class JwtDto {
  @ApiProperty()
  @IsUUID()
  sub: string

  @ApiProperty()
  @IsString()
  @MinLength(3)
  username: string
}

export class SignUpDto extends OmitType(CreateUserDto, ['email']) {}

export class SignInDto extends OmitType(CreateUserDto, ['email']) {}

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
