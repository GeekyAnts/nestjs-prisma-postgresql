import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class RoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'The role to assign to the user',
  })
  @IsNotEmpty()
  role: Role;
}
