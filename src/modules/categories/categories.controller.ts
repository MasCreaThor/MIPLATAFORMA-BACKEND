// src/modules/categories/categories.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCategoryDto: CreateCategoryDto, @CurrentUser('userId') userId: string) {
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.create(createCategoryDto, peopleId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser('userId') userId: string) {
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.findAllForUser(peopleId);
  }

  @Get('system')
  @Public()
  findSystemCategories() {
    return this.categoriesService.findSystemCategories();
  }

  @Get('root')
  @UseGuards(JwtAuthGuard)
  findAllRoot(@CurrentUser('userId') userId: string) {
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.findRootForUser(peopleId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.findOneForUser(id, peopleId);
  }

  @Get(':id/children')
  @UseGuards(JwtAuthGuard)
  findChildren(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.findChildrenForUser(id, peopleId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string, 
    @Body() updateCategoryDto: UpdateCategoryDto, 
    @CurrentUser('userId') userId: string
  ) {
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.update(id, updateCategoryDto, peopleId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    const peopleId = new Types.ObjectId(userId);
    return this.categoriesService.remove(id, peopleId);
  }
}