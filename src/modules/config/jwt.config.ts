import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expirationTime: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
  refreshExpirationTime: parseInt(process.env.JWT_REFRESH_EXPIRATION || '86400', 10),
}));