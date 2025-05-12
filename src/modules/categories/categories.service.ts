// src/modules/categories/categories.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    // Validar que si tiene parentId, este exista y sea o bien una categoría del sistema o una categoría del usuario
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryModel.findById(createCategoryDto.parentId).exec();
      
      if (!parentCategory) {
        throw new NotFoundException(`La categoría padre con ID ${createCategoryDto.parentId} no existe`);
      }
      
      // Solo se puede crear una subcategoría bajo una categoría del sistema o una categoría propia
      if (!parentCategory.isSystem && parentCategory.peopleId.toString() !== peopleId.toString()) {
        throw new ForbiddenException('No puedes crear subcategorías en categorías que no te pertenecen');
      }
    } else {
      // Si no tiene parentId, el usuario no puede crear categorías principales (solo subcategorías)
      // Solo las categorías del sistema pueden ser categorías padre principales
      throw new ForbiddenException('Solo puedes crear subcategorías bajo categorías existentes');
    }
    
    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      peopleId,
      isSystem: false, // Los usuarios nunca pueden crear categorías del sistema
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

  // Obtener todas las categorías visibles para un usuario
  async findAllForUser(peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({
      $or: [
        { isSystem: true }, // Categorías del sistema
        { peopleId } // Categorías propias del usuario
      ]
    }).exec();
  }

  // Obtener solo las categorías del sistema
  async findSystemCategories(): Promise<Category[]> {
    return this.categoryModel.find({ isSystem: true }).exec();
  }

  // Obtener las categorías raíz visibles para un usuario
  async findRootForUser(peopleId: Types.ObjectId): Promise<Category[]> {
    return this.categoryModel.find({
      parentId: null,
      $or: [
        { isSystem: true },
        { peopleId }
      ]
    }).exec();
  }

  // Obtener una categoría si es visible para el usuario
  async findOneForUser(id: string, peopleId: Types.ObjectId): Promise<Category> {
    const category = await this.categoryModel.findOne({ 
      _id: id,
      $or: [
        { isSystem: true },
        { peopleId }
      ]
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

  // Obtener las subcategorías visibles para un usuario
  async findChildrenForUser(id: string, peopleId: Types.ObjectId): Promise<Category[]> {
    // Primero verificar que el usuario puede ver la categoría padre
    await this.findOneForUser(id, peopleId);
    
    // Luego obtener las subcategorías visibles
    return this.categoryModel.find({ 
      parentId: new Types.ObjectId(id),
      $or: [
        { isSystem: true },
        { peopleId }
      ]
    }).exec();
  }

  // Actualizar una categoría (solo si pertenece al usuario y no es del sistema)
  async update(id: string, updateCategoryDto: UpdateCategoryDto, peopleId: Types.ObjectId): Promise<Category> {
    // Verificar si la categoría existe y pertenece al usuario
    const category = await this.categoryModel.findById(id).exec();
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    // No permitir actualizar categorías del sistema
    if (category.isSystem) {
      throw new ForbiddenException('No puedes modificar categorías del sistema');
    }
    
    // Verificar que la categoría pertenece al usuario
    if (category.peopleId.toString() !== peopleId.toString()) {
      throw new ForbiddenException('No puedes modificar categorías que no te pertenecen');
    }
    
    // Si se está cambiando el parentId, verificar que el nuevo padre es válido
    if (updateCategoryDto.parentId && 
      (!category.parentId || category.parentId.toString() !== updateCategoryDto.parentId.toString())) {
    const newParent = await this.categoryModel.findById(updateCategoryDto.parentId).exec();
    
    if (!newParent) {
      throw new NotFoundException(`La categoría padre con ID ${updateCategoryDto.parentId} no existe`);
    }
    
    // Solo se puede mover a una categoría del sistema o una categoría propia
    if (!newParent.isSystem && newParent.peopleId.toString() !== peopleId.toString()) {
      throw new ForbiddenException('No puedes mover la categoría a una categoría que no te pertenece');
    }
  }
    
    // Actualizar la categoría
    const updatedCategory = await this.categoryModel.findOneAndUpdate(
      { _id: id },
      { 
        $set: { 
          ...updateCategoryDto,
          isSystem: category.isSystem, // Mantener el valor de isSystem
        } 
      },
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

  // Eliminar una categoría (solo si pertenece al usuario y no es del sistema)
  async remove(id: string, peopleId: Types.ObjectId): Promise<Category> {
    // Verificar si la categoría existe y pertenece al usuario
    const category = await this.categoryModel.findById(id).exec();
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    // No permitir eliminar categorías del sistema
    if (category.isSystem) {
      throw new ForbiddenException('No puedes eliminar categorías del sistema');
    }
    
    // Verificar que la categoría pertenece al usuario
    if (category.peopleId.toString() !== peopleId.toString()) {
      throw new ForbiddenException('No puedes eliminar categorías que no te pertenecen');
    }
    
    // Buscar si hay subcategorías
    const hasChildren = await this.categoryModel.exists({ parentId: new Types.ObjectId(id) });
    if (hasChildren) {
      throw new ForbiddenException('No puedes eliminar una categoría que tiene subcategorías');
    }
    
    // Eliminar la categoría
    const deletedCategory = await this.categoryModel.findOneAndDelete({ 
      _id: id
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