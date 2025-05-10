// src/modules/notifications/dto/mark-read.dto.ts
import { IsArray, IsMongoId, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class MarkReadDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  ids?: Types.ObjectId[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  all?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  value?: boolean = true;
}