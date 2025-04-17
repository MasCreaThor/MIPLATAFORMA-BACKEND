// src/modules/users/dto/update-user.dto.ts

import { IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsArray()
  @IsOptional()
  roles?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  preferences?: {
    theme?: string;
    language?: string;
    dashboardLayout?: Record<string, any>[];
    notifications?: boolean;
  };
}