import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/repositories/users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private user: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existingUser = await this.validateExistingUser(email);
    if (existingUser) {
      throw new BadRequestException('User with email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.user.createUser({
      email,
      password: hashedPassword,
      name,
    });

    return this.prepareAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.validateExistingUser(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.prepareAuthResponse(user);
  }

  async googleAuth(idToken: string) {
    const clientId = this.configService.get('google.clientId');
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let user = await this.validateExistingUser(email);
    if (!user) {
      const password = await bcrypt.hash(randomUUID(), 10);
      user = await this.user.createUser({
        email,
        password,
        name,
      });
    }

    return this.prepareAuthResponse(user);
  }

  private generateToken(user: any) {
    const accessToken = this.jwtService.sign(user, {
      secret: this.configService.get('jwt.secrets'),
      expiresIn: this.configService.get('jwt.expiresInn', '5d'),
    });

    const { exp } = this.jwtService.decode(accessToken);
    return {
      accessToken,
      expiresIn: exp,
    };
  }

  async validateExistingUser(email: string): Promise<any> {
    const user = await this.user.findByEmail({ email });
    if (!user) {
      return null;
    }
    return user;
  }

  async assignRoleToUser(user: any, role: Role) {
    const updatedUser = await this.user.updateUser({
      userId: user.id,
      data: {
        role: role,
      },
    });

    return this.prepareAuthResponse(updatedUser);
  }

  private prepareAuthResponse(user: any) {
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: this.generateToken(userWithoutPassword),
    };
  }
}
