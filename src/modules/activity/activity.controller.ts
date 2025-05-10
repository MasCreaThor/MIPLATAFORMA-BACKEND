// src/modules/activity/activity.controller.ts
import {
    Controller,
    Get,
    Query,
    UseGuards,
    Param,
  } from '@nestjs/common';
  import { ActivityService } from './activity.service';
  import { FilterActivitiesDto } from './dto/filter-activities.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard';
  import { Types } from 'mongoose';
  
  @Controller('activity')
  @UseGuards(JwtAuthGuard)
  export class ActivityController {
    constructor(private readonly activityService: ActivityService) {}
  
    @Get()
    findAll(@Query() filterDto: FilterActivitiesDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.activityService.findAll(mockPeopleId, filterDto);
    }
  
    @Get('recent')
    getRecentActivity(@Query('limit') limit: number) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.activityService.getRecentActivity(mockPeopleId, limit || 10);
    }
  
    @Get('counts')
    getActivityCounts() {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.activityService.getActivityCounts(mockPeopleId);
    }
  
    @Get('counts/by-action')
    getActivityCountsByAction() {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.activityService.getActivityCountsByAction(mockPeopleId);
    }
  
    @Get('timeline')
    getActivityTimeline(@Query('days') days: number) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.activityService.getActivityTimeline(mockPeopleId, days || 30);
    }
  }