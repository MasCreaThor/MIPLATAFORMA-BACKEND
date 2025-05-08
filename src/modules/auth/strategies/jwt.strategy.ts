// src/modules/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  async validate(payload: any) {
    try {
      // Uso de findOne en lugar de findById
      // Y uso de payload.userId en lugar de payload.sub para consistencia con auth.service.ts
      await this.usersService.findOne(payload.userId);
      return { userId: payload.userId, email: payload.email };
    } catch (error) {
      throw new UnauthorizedException('Usuario no válido o token expirado');
    }
  }
}