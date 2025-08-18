import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class InvalidateTokenResponse {
  @ApiProperty()
  @IsBoolean()
  isValid: boolean
}
