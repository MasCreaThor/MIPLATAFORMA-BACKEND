// src/modules/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityAction, EntityType } from '../activity/schemas/activity.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private activityService: ActivityService,
    private notificationsService: NotificationsService
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
    
    // Generar notificación
    await this.notificationsService.createNotificationFromActivity(
      peopleId,
      ActivityAction.CREATE,
      EntityType.CATEGORY,
      new Types.ObjectId(savedCategory._id as string),
      savedCategory.name,
      { parentId: savedCategory.parentId?.toString() || null }
    );
    
    return savedCategory;
  }

  // Método actualizado para soportar usuarios autenticados y no autenticados
  async findAllPublic(peopleId?: Types.ObjectId): Promise<Category[]> {
    if (peopleId) {
      // Usuario autenticado: devolver categorías propias + públicas
      return this.categoryModel.find({
        $or: [
          { peopleId },
          { isPublic: true }
        ]
      }).exec();
    } else {
      // Usuario no autenticado: solo categorías públicas
      return this.categoryModel.find({ isPublic: true }).exec();
    }
  }

  // Método original mantiene compatibilidad con código existente
  async findAll(peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({ peopleId }).exec();
  }

  // Método actualizado para soportar usuarios autenticados y no autenticados
  async findAllRootPublic(peopleId?: Types.ObjectId): Promise<Category[]> {
    if (peopleId) {
      // Usuario autenticado: devolver categorías raíz propias + públicas
      return this.categoryModel.find({
        parentId: null,
        $or: [
          { peopleId },
          { isPublic: true }
        ]
      }).exec();
    } else {
      // Usuario no autenticado: solo categorías raíz públicas
      return this.categoryModel.find({ 
        parentId: null,
        isPublic: true 
      }).exec();
    }
  }

  // Método original mantiene compatibilidad con código existente
  async findAllRoot(peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({ peopleId, parentId: null }).exec();
  }

  // Método actualizado para soportar usuarios autenticados y no autenticados
  async findOnePublic(id: string, peopleId?: Types.ObjectId): Promise<Category> {
    let query: any = { _id: id };
    
    if (peopleId) {
      // Usuario autenticado: devolver categoría propia o pública
      query.$or = [
        { peopleId },
        { isPublic: true }
      ];
    } else {
      // Usuario no autenticado: solo categoría pública
      query.isPublic = true;
    }
    
    const category = await this.categoryModel.findOne(query).exec();
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    // Registrar la actividad de vista solo si hay usuario autenticado
    if (peopleId) {
      await this.activityService.trackActivity(
        peopleId,
        ActivityAction.VIEW,
        EntityType.CATEGORY,
        new Types.ObjectId(category._id as string),
        { parentId: category.parentId?.toString() || null },
        category.name
      );
    }
    
    return category;
  }

  // Método original mantiene compatibilidad con código existente
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

  // Método actualizado para soportar usuarios autenticados y no autenticados
  async findChildrenPublic(id: string, peopleId?: Types.ObjectId): Promise<Category[]> {
    if (peopleId) {
      // Usuario autenticado: devolver categorías hijas propias + públicas
      return this.categoryModel.find({ 
        parentId: new Types.ObjectId(id),
        $or: [
          { peopleId },
          { isPublic: true }
        ]
      }).exec();
    } else {
      // Usuario no autenticado: solo categorías hijas públicas
      return this.categoryModel.find({ 
        parentId: new Types.ObjectId(id),
        isPublic: true 
      }).exec();
    }
  }

  // Método original mantiene compatibilidad con código existente
  async findChildren(id: string, peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({ 
      parentId: new Types.ObjectId(id), 
      peopleId 
    }).exec();
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
    
    // Generar notificación
    await this.notificationsService.createNotificationFromActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.CATEGORY,
      new Types.ObjectId(updatedCategory._id as string),
      updatedCategory.name,
      { parentId: updatedCategory.parentId?.toString() || null }
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
    
    // Generar notificación
    await this.notificationsService.createNotificationFromActivity(
      peopleId,
      ActivityAction.DELETE,
      EntityType.CATEGORY,
      new Types.ObjectId(id),
      category.name,
      { parentId: category.parentId?.toString() || null }
    );
    
    return deletedCategory;
  }
}