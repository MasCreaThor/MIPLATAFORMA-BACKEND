// src/modules/notifications/dto/paginated-response.dto.ts
import { IsInt, IsBoolean, IsNotEmpty, IsArray } from 'class-validator';
import { NotificationDocument } from '../schemas/notification.schema';

export class PaginatedNotificationResponseDto {
  @IsArray()
  @IsNotEmpty()
  items: NotificationDocument[];

  @IsInt()
  total: number;

  @IsInt()
  page: number;

  @IsInt()
  limit: number;

  @IsInt()
  pages: number;

  @IsBoolean()
  hasNextPage: boolean;

  @IsBoolean()
  hasPrevPage: boolean;

  @IsInt()
  unreadCount: number;
}