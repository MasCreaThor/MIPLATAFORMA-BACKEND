// src/modules/tags/tags.controller.ts
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
  import { TagsService } from './tags.service';
  import { CreateTagDto } from './dto/create-tag.dto';
  import { UpdateTagDto } from './dto/update-tag.dto';
  import { FilterTagsDto } from './dto/filter-tags.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard';
  import { Types } from 'mongoose';
  
  @Controller('tags')
  @UseGuards(JwtAuthGuard)
  export class TagsController {
    constructor(private readonly tagsService: TagsService) {}
  
    @Post()
    create(@Body() createTagDto: CreateTagDto) {
      // Temporalmente usando un ID ficticio para peopleId
      // En producción esto vendría del token de autenticación
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.create(createTagDto, mockPeopleId);
    }
  
    @Get()
    findAll(@Query() filterDto: FilterTagsDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.findAll(mockPeopleId, filterDto);
    }
  
    @Get('popular')
    getPopularTags(@Query('limit') limit: number) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.getPopularTags(mockPeopleId, limit || 10);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.findOne(id, mockPeopleId);
    }
  
    @Get('by-name/:name')
    findByName(@Param('name') name: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.findByName(name, mockPeopleId);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.update(id, updateTagDto, mockPeopleId);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.remove(id, mockPeopleId);
    }
  
    @Post(':id/increment-usage')
    incrementUsage(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.incrementUsageCount(id, mockPeopleId);
    }
  
    @Post('bulk-create')
    bulkCreateOrUpdate(@Body() body: { tags: string[] }) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.tagsService.bulkCreateOrUpdate(body.tags, mockPeopleId);
    }
  }