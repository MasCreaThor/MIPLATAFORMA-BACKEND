// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.register(registerDto);
    
    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id || user['_id']?.toString() || '',
      email: user.email,
    });
    
    return {
      ...user,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmailWithPassword(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // Usar un enfoque más seguro para eliminar la contraseña
        let userObj: Record<string, any>;
        
        if (user instanceof Document) {
          userObj = user.toObject();
        } else {
          userObj = { ...user as Object };
        }
        
        // Eliminar la contraseña del objeto
        const { password: _, ...result } = userObj;
        return result;
      }
      return null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id || user['_id']?.toString() || '',
      email: user.email,
    });
    
    // Get the people profile
    const profile = await this.usersService.findOne(user.id || user['_id']?.toString() || '');
    
    return {
      user: profile,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      // Check if user exists
      const user = await this.usersService.findOne(payload.userId);
      
      // Generate new tokens
      const tokens = this.generateTokens({
        userId: payload.userId,
        email: payload.email,
      });
      
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(payload: { userId: string; email: string }) {
    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') + 's',
    });
    
    return {
      accessToken,
      refreshToken,
    };
  }
}