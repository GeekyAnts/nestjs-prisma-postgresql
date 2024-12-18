import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ManualLoginDto } from './dto/manual-login.dto';
import { ManualSignupDto } from './dto/manual-signup.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guards/role.guard';
import { RoleDto } from './dto/role.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google/verify')
  async googleAuthVerify(@Body() googleAuthBody: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthBody.id_token);
  }

  @Post('signup')
  async register(@Body() signupBody: ManualSignupDto) {
    return this.authService.register(
      signupBody.name,
      signupBody.email,
      signupBody.password,
    );
  }

  @Post('login')
  async login(@Body() loginBody: ManualLoginDto) {
    const data = await this.authService.login(
      loginBody.email,
      loginBody.password,
    );
    return data;
  }

  @Post('role')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async setRole(@Request() req, @Body() roleBody: RoleDto) {
    return this.authService.assignRoleToUser(req.user, roleBody.role);
  }

  @Get('admin/profile')
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAdminProfile(@Request() req: any) {
    return req.user;
  }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('user/profile')
  @ApiBearerAuth()
  getUserProfile(@Request() req: any) {
    return req.user;
  }
}
