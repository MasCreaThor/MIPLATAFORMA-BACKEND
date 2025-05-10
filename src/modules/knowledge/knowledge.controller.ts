// src/modules/knowledge/knowledge.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards
  } from '@nestjs/common';
  import { KnowledgeService } from './knowledge.service';
  import { CreateKnowledgeItemDto } from './dto/create-knowledge-item.dto';
  import { UpdateKnowledgeItemDto } from './dto/update-knowledge-item.dto';
  import { FilterKnowledgeItemsDto } from './dto/filter-knowledge-items.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard';
  import { Types } from 'mongoose';
  
  @Controller('knowledge')
  @UseGuards(JwtAuthGuard)
  export class KnowledgeController {
    constructor(private readonly knowledgeService: KnowledgeService) {}
  
    @Post()
    create(@Body() createKnowledgeItemDto: CreateKnowledgeItemDto) {
      // Temporalmente usando un ID ficticio para peopleId
      // En producción esto vendría del token de autenticación
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.create(createKnowledgeItemDto, mockPeopleId);
    }
  
    @Get()
    findAll(@Query() filterDto: FilterKnowledgeItemsDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.findAll(mockPeopleId, filterDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.findOne(id, mockPeopleId);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateKnowledgeItemDto: UpdateKnowledgeItemDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.update(id, updateKnowledgeItemDto, mockPeopleId);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.remove(id, mockPeopleId);
    }
  
    @Post(':id/increment-usage')
    incrementUsage(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.incrementUsageCount(id, mockPeopleId);
    }
  
    @Get('by-category/:categoryId')
    findByCategory(@Param('categoryId') categoryId: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.findByCategory(categoryId, mockPeopleId);
    }
  
    @Get('by-tags')
    findByTags(@Query('tags') tags: string[]) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.findByTags(tags, mockPeopleId);
    }
  
    @Get(':id/related')
    findRelatedItems(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.findRelatedItems(id, mockPeopleId);
    }
  
    @Post(':id/related/:relatedId')
    addRelatedItem(@Param('id') id: string, @Param('relatedId') relatedId: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.addRelatedItem(id, relatedId, mockPeopleId);
    }
  
    @Delete(':id/related/:relatedId')
    removeRelatedItem(@Param('id') id: string, @Param('relatedId') relatedId: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.knowledgeService.removeRelatedItem(id, relatedId, mockPeopleId);
    }
  }