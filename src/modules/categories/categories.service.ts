// src/modules/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, peopleId: Types.ObjectId): Promise<Category> {
    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      peopleId,
    });
    return createdCategory.save();
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
    
    return updatedCategory;
  }

  async remove(id: string, peopleId: Types.ObjectId): Promise<Category> {
    const deletedCategory = await this.categoryModel.findOneAndDelete({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!deletedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    return deletedCategory;
  }

  async findChildren(id: string, peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({ 
      parentId: new Types.ObjectId(id), 
      peopleId 
    }).exec();
  }
}