import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    example: 'eyJhbGci..',
    description: 'The id token from Google OAuth2',
  })
  @IsNotEmpty()
  id_token: string;
}
