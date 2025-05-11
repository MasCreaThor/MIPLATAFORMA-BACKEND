// src/modules/categories/categories.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCategoryDto: CreateCategoryDto, @CurrentUser('userId') userId: string) {
    // Convertir el userId a ObjectId o usar el userId directamente si tu servicio lo admite
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.create(createCategoryDto, peopleId);
  }

  @Get()
  // No aplicamos el guardia JwtAuthGuard para permitir recuperar categorías sin autenticación
  findAll() {
    // Usamos un ID ficticio solo para desarrollo
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.findAll(mockPeopleId);
  }

  @Get('root')
  // No aplicamos el guardia JwtAuthGuard para permitir recuperar categorías sin autenticación
  findAllRoot() {
    // Usamos un ID ficticio solo para desarrollo
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.findAllRoot(mockPeopleId);
  }

  @Get(':id')
  // No aplicamos el guardia JwtAuthGuard para permitir recuperar categorías sin autenticación
  findOne(@Param('id') id: string) {
    // Usamos un ID ficticio solo para desarrollo
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.findOne(id, mockPeopleId);
  }

  @Get(':id/children')
  // No aplicamos el guardia JwtAuthGuard para permitir recuperar categorías sin autenticación
  findChildren(@Param('id') id: string) {
    // Usamos un ID ficticio solo para desarrollo
    const mockPeopleId = new Types.ObjectId();
    return this.categoriesService.findChildren(id, mockPeopleId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string, 
    @Body() updateCategoryDto: UpdateCategoryDto, 
    @CurrentUser('userId') userId: string
  ) {
    // Convertir el userId a ObjectId o usar el userId directamente
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.update(id, updateCategoryDto, peopleId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    // Convertir el userId a ObjectId o usar el userId directamente
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.remove(id, peopleId);
  }
}