// src/modules/tags/dto/create-tag.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}