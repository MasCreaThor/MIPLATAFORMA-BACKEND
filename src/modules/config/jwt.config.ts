// src/modules/config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION,
}));