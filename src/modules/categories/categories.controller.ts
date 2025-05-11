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
  findAll(@Request() req) {
    // Usar ID del usuario autenticado si está disponible, undefined si no lo está
    let peopleId: Types.ObjectId | undefined = undefined;
    if (req.user) {
      peopleId = new Types.ObjectId(req.user.userId);
    }
    return this.categoriesService.findAllPublic(peopleId);
  }

  @Get('root')
  findAllRoot(@Request() req) {
    // Usar ID del usuario autenticado si está disponible, undefined si no lo está
    let peopleId: Types.ObjectId | undefined = undefined;
    if (req.user) {
      peopleId = new Types.ObjectId(req.user.userId);
    }
    return this.categoriesService.findAllRootPublic(peopleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Usar ID del usuario autenticado si está disponible, undefined si no lo está
    let peopleId: Types.ObjectId | undefined = undefined;
    if (req.user) {
      peopleId = new Types.ObjectId(req.user.userId);
    }
    return this.categoriesService.findOnePublic(id, peopleId);
  }

  @Get(':id/children')
  findChildren(@Param('id') id: string, @Request() req) {
    // Usar ID del usuario autenticado si está disponible, undefined si no lo está
    let peopleId: Types.ObjectId | undefined = undefined;
    if (req.user) {
      peopleId = new Types.ObjectId(req.user.userId);
    }
    return this.categoriesService.findChildrenPublic(id, peopleId);
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