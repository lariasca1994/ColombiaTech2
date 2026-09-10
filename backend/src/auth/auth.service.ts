import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

export interface AuthResult {
  token: string;
  user: {
    _id: string;
    name: string;
    lastname?: string;
    email: string;
    avatar?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user._id.toString(), email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }
}