// src/modules/users/dto/create-user.dto.ts

import { IsString, IsNotEmpty, IsMongoId, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsMongoId()
  @IsNotEmpty()
  peopleId: Types.ObjectId | string;

  @IsArray()
  @IsOptional()
  roles?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}