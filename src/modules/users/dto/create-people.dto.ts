// src/modules/users/dto/create-people.dto.ts

import { IsString, IsNotEmpty, IsEmail, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreatePeopleDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsObject()
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  @IsDateString()
  @IsOptional()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;
}