// src/modules/notifications/notifications.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { NotificationsService } from './notifications.service';
  import { CreateNotificationDto } from './dto/create-notification.dto';
  import { FilterNotificationsDto } from './dto/filter-notifications.dto';
  import { UpdatePreferencesDto } from './dto/update-preferences.dto';
  import { MarkReadDto } from './dto/mark-read.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard';
  import { Types } from 'mongoose';
  
  @Controller('notifications')
  @UseGuards(JwtAuthGuard)
  export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}
  
    @Post()
    create(@Body() createNotificationDto: CreateNotificationDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.create(mockPeopleId, createNotificationDto);
    }
  
    @Get()
    findAll(@Query() filterDto: FilterNotificationsDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.findAll(mockPeopleId, filterDto);
    }
  
    @Get('unread/count')
    getUnreadCount() {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.getUnreadCount(mockPeopleId);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.findOne(id, mockPeopleId);
    }
  
    @Patch('mark-read')
    markAsRead(@Body() markReadDto: MarkReadDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.markAsRead(mockPeopleId, markReadDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.delete(id, mockPeopleId);
    }
  
    @Delete()
    removeAll() {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.deleteAll(mockPeopleId);
    }
  
    @Get('preferences')
    getPreferences() {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.getPreferences(mockPeopleId);
    }
  
    @Patch('preferences')
    updatePreferences(@Body() updatePreferencesDto: UpdatePreferencesDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.notificationsService.updatePreferences(mockPeopleId, updatePreferencesDto);
    }
  }