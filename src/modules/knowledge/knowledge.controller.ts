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
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
constructor(private readonly knowledgeService: KnowledgeService) {}

@Post()
create(@Body() createKnowledgeItemDto: CreateKnowledgeItemDto, @CurrentUser('userId') userId: string) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.create(createKnowledgeItemDto, peopleId);
}

@Get()
findAll(@Query() filterDto: FilterKnowledgeItemsDto, @CurrentUser('userId') userId: string) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.findAll(peopleId, filterDto);
}

@Get(':id')
findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.findOne(id, peopleId);
}

@Patch(':id')
update(
  @Param('id') id: string, 
  @Body() updateKnowledgeItemDto: UpdateKnowledgeItemDto, 
  @CurrentUser('userId') userId: string
) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.update(id, updateKnowledgeItemDto, peopleId);
}

@Delete(':id')
remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.remove(id, peopleId);
}

@Post(':id/increment-usage')
incrementUsage(@Param('id') id: string, @CurrentUser('userId') userId: string) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.incrementUsageCount(id, peopleId);
}

@Get('by-category/:categoryId')
findByCategory(@Param('categoryId') categoryId: string, @CurrentUser('userId') userId: string) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.findByCategory(categoryId, peopleId);
}

@Get('by-tags')
findByTags(@Query('tags') tags: string[], @CurrentUser('userId') userId: string) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.findByTags(tags, peopleId);
}

@Get(':id/related')
findRelatedItems(@Param('id') id: string, @CurrentUser('userId') userId: string) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.findRelatedItems(id, peopleId);
}

@Post(':id/related/:relatedId')
addRelatedItem(
  @Param('id') id: string, 
  @Param('relatedId') relatedId: string, 
  @CurrentUser('userId') userId: string
) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.addRelatedItem(id, relatedId, peopleId);
}

@Delete(':id/related/:relatedId')
removeRelatedItem(
  @Param('id') id: string, 
  @Param('relatedId') relatedId: string, 
  @CurrentUser('userId') userId: string
) {
  // Usar el ID real del usuario desde el token JWT
  const peopleId = new Types.ObjectId(userId);
  return this.knowledgeService.removeRelatedItem(id, relatedId, peopleId);
}
}