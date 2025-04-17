import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      // Actualizar último login
      if (user._id) {
        await this.usersService.updateLastLogin(user._id.toString());
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = user._id?.toString();
    if (!userId) {
      throw new UnauthorizedException('User ID not found');
    }

    const payload = { username: user.username, sub: userId, roles: user.roles };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        username: user.username,
        roles: user.roles,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const existingEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new UnauthorizedException('Email already exists');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear la entidad People primero
    const people = await this.usersService.createPeople({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      phoneNumber: registerDto.phoneNumber,
    });

    if (!people._id) {
      throw new UnauthorizedException('Failed to create people profile');
    }

    // Crear el usuario con referencia a People
    const newUser = await this.usersService.create({
      username: registerDto.username,
      password: hashedPassword,
      peopleId: people._id as any,  // Usamos 'as any' para evitar el error de tipo
      roles: registerDto.roles || ['user'],
      isActive: registerDto.isActive !== undefined ? registerDto.isActive : true,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser;
    
    const userId = result._id?.toString();
    if (!userId) {
      throw new UnauthorizedException('User ID not found');
    }
    
    // Generar token JWT
    const payload = { username: result.username, sub: userId, roles: result.roles };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        username: result.username,
        roles: result.roles,
      },
    };
  }

  // Método para renovar token
  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { 
      username: user.username, 
      sub: user._id?.toString(), 
      roles: user.roles 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}