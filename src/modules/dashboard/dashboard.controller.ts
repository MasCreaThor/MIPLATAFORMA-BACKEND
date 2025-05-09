// src/modules/dashboard/dashboard.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { DashboardService } from './dashboard.service';
  import { UpdateDashboardConfigDto } from './dto/update-dashboard-config.dto';
  import { AddWidgetDto, UpdateWidgetDto } from './dto/widget.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard';
  import { Types } from 'mongoose';
  
  @Controller('dashboard')
  @UseGuards(JwtAuthGuard)
  export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}
  
    @Get('config')
    getDashboardConfig() {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.dashboardService.getOrCreateDashboardConfig(mockPeopleId);
    }
  
    @Patch('config')
    updateDashboardConfig(@Body() updateDto: UpdateDashboardConfigDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.dashboardService.updateDashboardConfig(mockPeopleId, updateDto);
    }
  
    @Post('widgets')
    addWidget(@Body() addWidgetDto: AddWidgetDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.dashboardService.addWidget(mockPeopleId, addWidgetDto);
    }
  
    @Patch('widgets/:widgetId')
    updateWidget(
      @Param('widgetId') widgetId: string,
      @Body() updateWidgetDto: UpdateWidgetDto
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.dashboardService.updateWidget(mockPeopleId, widgetId, updateWidgetDto);
    }
  
    @Delete('widgets/:widgetId')
    removeWidget(@Param('widgetId') widgetId: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.dashboardService.removeWidget(mockPeopleId, widgetId);
    }
  
    @Get('stats')
    getDashboardStats() {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.dashboardService.getDashboardStats(mockPeopleId);
    }
  
    @Get('recent/:type')
    getRecentItems(
      @Param('type') type: string,
      @Query('limit') limit: number
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.dashboardService.getRecentItems(mockPeopleId, type, limit || 5);
    }
  
    @Get('most-used/:type')
    getMostUsedItems(
      @Param('type') type: string,
      @Query('limit') limit: number
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.dashboardService.getMostUsedItems(mockPeopleId, type, limit || 5);
    }
  }