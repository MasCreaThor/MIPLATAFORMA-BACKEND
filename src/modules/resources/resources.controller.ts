// src/modules/resources/resources.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FilterResourcesDto } from './dto/filter-resources.dto';
import { Types } from 'mongoose';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  // En un escenario real, añadiríamos @UseGuards(JwtAuthGuard) y obtendríamos el peopleId del request
  create(@Body() createResourceDto: CreateResourceDto) {
    // Temporalmente usando un ID ficticio para peopleId
    // En producción esto vendría del token de autenticación
    const mockPeopleId = new Types.ObjectId();
    return this.resourcesService.create(createResourceDto, mockPeopleId);
  }

  @Get()
  findAll(@Query() filterDto: FilterResourcesDto) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.resourcesService.findAll(mockPeopleId, filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.resourcesService.findOne(id, mockPeopleId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.resourcesService.update(id, updateResourceDto, mockPeopleId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.resourcesService.remove(id, mockPeopleId);
  }

  @Post(':id/increment-usage')
  incrementUsage(@Param('id') id: string) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.resourcesService.incrementUsageCount(id, mockPeopleId);
  }

  @Get('by-category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.resourcesService.findByCategory(categoryId, mockPeopleId);
  }

  @Get('by-tags')
  findByTags(@Query('tags') tags: string[]) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.resourcesService.findByTags(tags, mockPeopleId);
  }
}