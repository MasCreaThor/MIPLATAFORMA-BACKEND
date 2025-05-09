// src/modules/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, EntityType } from '../activity/schemas/activity.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private activityService: ActivityService
  ) {}

  async create(createCategoryDto: CreateCategoryDto, peopleId: Types.ObjectId): Promise<Category> {
    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      peopleId,
    });
    
    const savedCategory = await createdCategory.save();
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.CREATE,
      EntityType.CATEGORY,
      new Types.ObjectId(savedCategory._id as string),
      { parentId: savedCategory.parentId?.toString() || null },
      savedCategory.name
    );
    
    return savedCategory;
  }

  async findAll(peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({ peopleId }).exec();
  }

  async findAllRoot(peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({ peopleId, parentId: null }).exec();
  }

  async findOne(id: string, peopleId: Types.ObjectId): Promise<Category> {
    const category = await this.categoryModel.findOne({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    // Registrar la actividad de vista
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.VIEW,
      EntityType.CATEGORY,
      new Types.ObjectId(category._id as string),
      { parentId: category.parentId?.toString() || null },
      category.name
    );
    
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, peopleId: Types.ObjectId): Promise<Category> {
    const updatedCategory = await this.categoryModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $set: updateCategoryDto },
      { new: true },
    ).exec();
    
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.CATEGORY,
      new Types.ObjectId(updatedCategory._id as string),
      { parentId: updatedCategory.parentId?.toString() || null },
      updatedCategory.name
    );
    
    return updatedCategory;
  }

  async remove(id: string, peopleId: Types.ObjectId): Promise<Category> {
    // Primero encontrar la categoría para tener información antes de eliminarla
    const category = await this.findOne(id, peopleId);
    
    const deletedCategory = await this.categoryModel.findOneAndDelete({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!deletedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.DELETE,
      EntityType.CATEGORY,
      new Types.ObjectId(id),
      { parentId: category.parentId?.toString() || null },
      category.name
    );
    
    return deletedCategory;
  }

  async findChildren(id: string, peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({ 
      parentId: new Types.ObjectId(id), 
      peopleId 
    }).exec();
  }
}