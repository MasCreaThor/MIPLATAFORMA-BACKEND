// src/modules/people/dto/create-people.dto.ts
import { IsString, IsEmail, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class PreferencesDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  dashboardLayout?: any[];

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}

export class CreatePeopleDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  address?: AddressDto;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  additionalInfo?: Record<string, any>;

  @IsString()
  username: string;

  @IsOptional()
  roles?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  lastLogin?: string;

  @IsOptional()
  preferences?: PreferencesDto;
}