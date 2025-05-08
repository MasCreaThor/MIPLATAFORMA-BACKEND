// src/modules/categories/categories.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  // En un escenario real, añadiríamos @UseGuards(JwtAuthGuard) y obtendríamos el peopleId del request
  create(@Body() createCategoryDto: CreateCategoryDto) {
    // Temporalmente usando un ID ficticio para peopleId
    // En producción esto vendría del token de autenticación
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.create(createCategoryDto, mockPeopleId);
  }

  @Get()
  findAll() {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.findAll(mockPeopleId);
  }

  @Get('root')
  findAllRoot() {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.findAllRoot(mockPeopleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.findOne(id, mockPeopleId);
  }

  @Get(':id/children')
  findChildren(@Param('id') id: string) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.findChildren(id, mockPeopleId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.update(id, updateCategoryDto, mockPeopleId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // Temporalmente usando un ID ficticio para peopleId
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.remove(id, mockPeopleId);
  }
}