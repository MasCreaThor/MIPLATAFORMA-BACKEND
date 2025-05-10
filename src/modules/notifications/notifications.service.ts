// src/modules/notifications/notifications.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  Notification, 
  NotificationDocument, 
  NotificationType, 
  NotificationPriority 
} from './schemas/notification.schema';
import { 
  NotificationPreference, 
  NotificationPreferenceDocument,
  NotificationCategory,
  NotificationChannel
} from './schemas/notification-preference.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FilterNotificationsDto } from './dto/filter-notifications.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { PaginatedNotificationResponseDto } from './dto/paginated-response.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, EntityType } from '../activity/schemas/activity.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationPreference.name) private preferenceModel: Model<NotificationPreferenceDocument>,
    private activityService: ActivityService
  ) {}

  // Modificar firma para permitir null como retorno
  async create(peopleId: Types.ObjectId, createNotificationDto: CreateNotificationDto): Promise<NotificationDocument | null> {
    try {
      // Verificar preferencias de notificación
      const preference = await this.getOrCreatePreferences(peopleId);
      
      // Si las notificaciones están desactivadas, no crear
      if (!preference.enabled) {
        this.logger.log(`Notificaciones desactivadas para el usuario ${peopleId}`);
        return null;
      }
      
      // Verificar modo no molestar
      if (preference.doNotDisturb) {
        const now = new Date();
        const start = preference.doNotDisturbStart 
          ? new Date(preference.doNotDisturbStart) 
          : null;
        const end = preference.doNotDisturbEnd 
          ? new Date(preference.doNotDisturbEnd) 
          : null;
        
        if (start && end && now >= start && now <= end) {
          this.logger.log(`Modo no molestar activo para el usuario ${peopleId}`);
          return null;
        }
      }
      
      // Convertir fecha de expiración si existe
      // Usar tipo Date | undefined explícitamente
      let expiresAt: Date | undefined = undefined;
      if (createNotificationDto.expiresAt) {
        expiresAt = new Date(createNotificationDto.expiresAt);
      }
      
      // Crear notificación
      const notification = new this.notificationModel({
        peopleId,
        ...createNotificationDto,
        expiresAt,
      });
      
      const savedNotification = await notification.save();
      
      // Registrar actividad
      await this.activityService.trackActivity(
        peopleId,
        ActivityAction.CREATE,
        EntityType.DASHBOARD,
        new Types.ObjectId(savedNotification._id as string),
        { 
          action: 'notificationCreated',
          notificationType: savedNotification.type,
          notificationTitle: savedNotification.title
        },
        'Notification Created'
      );
      
      return savedNotification;
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    peopleId: Types.ObjectId, 
    filterDto: FilterNotificationsDto
  ): Promise<PaginatedNotificationResponseDto> {
    try {
      // Construir consulta base
      const query: any = { peopleId };
      
      // Verificar si debemos incluir notificaciones expiradas
      const now = new Date();
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ];
      
      // Añadir filtros si existen
      if (filterDto.isRead !== undefined) {
        query.isRead = filterDto.isRead;
      }
      
      if (filterDto.types && filterDto.types.length > 0) {
        query.type = { $in: filterDto.types };
      }
      
      if (filterDto.priorities && filterDto.priorities.length > 0) {
        query.priority = { $in: filterDto.priorities };
      }
      
      if (filterDto.relatedEntityType) {
        query.relatedEntityType = filterDto.relatedEntityType;
      }
      
      if (filterDto.relatedEntityId) {
        query.relatedEntityId = new Types.ObjectId(filterDto.relatedEntityId.toString());
      }
      
      if (filterDto.search) {
        query.$or = [
          { title: { $regex: filterDto.search, $options: 'i' } },
          { message: { $regex: filterDto.search, $options: 'i' } },
        ];
      }
      
      if (filterDto.startDate || filterDto.endDate) {
        query.createdAt = {};
        if (filterDto.startDate) {
          query.createdAt.$gte = new Date(filterDto.startDate);
        }
        if (filterDto.endDate) {
          query.createdAt.$lte = new Date(filterDto.endDate);
        }
      }
      
      // Calcular paginación
      const limit = filterDto.limit || 20;
      const skip = filterDto.skip || 0;
      const page = Math.floor(skip / limit) + 1;
      
      // Obtener total y total no leídos
      const total = await this.notificationModel.countDocuments(query).exec();
      const unreadCount = await this.notificationModel.countDocuments({ 
        peopleId, 
        isRead: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } }
        ]
      }).exec();
      
      // Opciones de ordenación
      const sortField = filterDto.sortBy || 'createdAt';
      const sortOrder = filterDto.sortOrder === 'asc' ? 1 : -1;
      const sort: any = {};
      sort[sortField] = sortOrder;
      
      // Obtener resultados
      const items = await this.notificationModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();
      
      // Calcular detalles de paginación
      const pages = Math.ceil(total / limit);
      
      // Registrar actividad si se está viendo notificaciones no leídas
      if (filterDto.isRead === false) {
        await this.activityService.trackActivity(
          peopleId,
          ActivityAction.VIEW,
          EntityType.DASHBOARD,
          new Types.ObjectId(),
          { 
            action: 'viewUnreadNotifications',
            count: items.length
          },
          'View Unread Notifications'
        );
      }
      
      return {
        items,
        total,
        page,
        limit,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
        unreadCount
      };
    } catch (error) {
      this.logger.error(`Error fetching notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string, peopleId: Types.ObjectId): Promise<NotificationDocument> {
    try {
      const notification = await this.notificationModel.findOne({ 
        _id: id, 
        peopleId 
      }).exec();
      
      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }
      
      return notification;
    } catch (error) {
      this.logger.error(`Error fetching notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUnreadCount(peopleId: Types.ObjectId): Promise<{ count: number }> {
    try {
      const now = new Date();
      const count = await this.notificationModel.countDocuments({ 
        peopleId, 
        isRead: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } }
        ]
      }).exec();
      
      return { count };
    } catch (error) {
      this.logger.error(`Error getting unread count: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markAsRead(peopleId: Types.ObjectId, markReadDto: MarkReadDto): Promise<{ success: boolean; count: number }> {
    try {
      let updateQuery = {};
      let count = 0;
      
      // Verificar si se están marcando todas las notificaciones
      if (markReadDto.all) {
        updateQuery = { peopleId };
        const result = await this.notificationModel.updateMany(
          updateQuery,
          { $set: { isRead: markReadDto.value ?? true } }
        ).exec();
        
        count = result.modifiedCount;
      } 
      // O si se están marcando notificaciones específicas
      else if (markReadDto.ids && markReadDto.ids.length > 0) {
        // Asegurar que todos los IDs son ObjectId válidos
        const validIds = markReadDto.ids.map(id => new Types.ObjectId(id.toString()));
        
        updateQuery = { 
          peopleId, 
          _id: { $in: validIds } 
        };
        
        const result = await this.notificationModel.updateMany(
          updateQuery,
          { $set: { isRead: markReadDto.value ?? true } }
        ).exec();
        
        count = result.modifiedCount;
      }
      
      // Registrar actividad
      if (count > 0) {
        await this.activityService.trackActivity(
          peopleId,
          ActivityAction.UPDATE,
          EntityType.DASHBOARD,
          new Types.ObjectId(),
          { 
            action: markReadDto.value ?? true ? 'markNotificationsAsRead' : 'markNotificationsAsUnread',
            count,
            all: markReadDto.all || false
          },
          markReadDto.value ?? true ? 'Mark Notifications as Read' : 'Mark Notifications as Unread'
        );
      }
      
      return { success: true, count };
    } catch (error) {
      this.logger.error(`Error marking notifications as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: string, peopleId: Types.ObjectId): Promise<{ success: boolean }> {
    try {
      const notification = await this.findOne(id, peopleId);
      
      const result = await this.notificationModel.deleteOne({ 
        _id: id, 
        peopleId 
      }).exec();
      
      const success = result.deletedCount > 0;
      
      if (success) {
        // Registrar actividad
        await this.activityService.trackActivity(
          peopleId,
          ActivityAction.DELETE,
          EntityType.DASHBOARD,
          new Types.ObjectId(id),
          { 
            action: 'deleteNotification',
            notificationType: notification.type,
            notificationTitle: notification.title
          },
          'Delete Notification'
        );
      }
      
      return { success };
    } catch (error) {
      this.logger.error(`Error deleting notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteAll(peopleId: Types.ObjectId): Promise<{ success: boolean; count: number }> {
    try {
      const result = await this.notificationModel.deleteMany({ peopleId }).exec();
      const count = result.deletedCount;
      
      if (count > 0) {
        // Registrar actividad
        await this.activityService.trackActivity(
          peopleId,
          ActivityAction.DELETE,
          EntityType.DASHBOARD,
          new Types.ObjectId(),
          { 
            action: 'deleteAllNotifications',
            count
          },
          'Delete All Notifications'
        );
      }
      
      return { success: true, count };
    } catch (error) {
      this.logger.error(`Error deleting all notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPreferences(peopleId: Types.ObjectId): Promise<NotificationPreferenceDocument> {
    try {
      return this.getOrCreatePreferences(peopleId);
    } catch (error) {
      this.logger.error(`Error fetching notification preferences: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updatePreferences(
    peopleId: Types.ObjectId, 
    updatePreferencesDto: UpdatePreferencesDto
  ): Promise<NotificationPreferenceDocument> {
    try {
      const preferences = await this.getOrCreatePreferences(peopleId);
      
      // Actualizar los campos proporcionados
      if (updatePreferencesDto.enabled !== undefined) {
        preferences.enabled = updatePreferencesDto.enabled;
      }
      
      if (updatePreferencesDto.channelPreferences) {
        preferences.channelPreferences = {
          ...preferences.channelPreferences,
          ...updatePreferencesDto.channelPreferences
        };
      }
      
      if (updatePreferencesDto.categoryPreferences) {
        preferences.categoryPreferences = {
          ...preferences.categoryPreferences,
          ...updatePreferencesDto.categoryPreferences
        };
      }
      
      if (updatePreferencesDto.doNotDisturb !== undefined) {
        preferences.doNotDisturb = updatePreferencesDto.doNotDisturb;
        
        if (updatePreferencesDto.doNotDisturb) {
          if (updatePreferencesDto.doNotDisturbStart) {
            preferences.doNotDisturbStart = new Date(updatePreferencesDto.doNotDisturbStart);
          }
          
          if (updatePreferencesDto.doNotDisturbEnd) {
            preferences.doNotDisturbEnd = new Date(updatePreferencesDto.doNotDisturbEnd);
          }
        }
      }
      
      preferences.updatedAt = new Date();
      
      const savedPreferences = await preferences.save();
      
      // Registrar actividad
      await this.activityService.trackActivity(
        peopleId,
        ActivityAction.UPDATE,
        EntityType.DASHBOARD,
        new Types.ObjectId(savedPreferences._id as string),
        { 
          action: 'updateNotificationPreferences',
          updatedFields: Object.keys(updatePreferencesDto)
        },
        'Update Notification Preferences'
      );
      
      return savedPreferences;
    } catch (error) {
      this.logger.error(`Error updating notification preferences: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getOrCreatePreferences(peopleId: Types.ObjectId): Promise<NotificationPreferenceDocument> {
    // Buscar preferencias existentes
    let preferences = await this.preferenceModel.findOne({ peopleId }).exec();
    
    // Si no existen, crear preferencias por defecto
    if (!preferences) {
      preferences = new this.preferenceModel({
        peopleId,
        enabled: true,
        channelPreferences: {
          [NotificationChannel.IN_APP]: true,
          [NotificationChannel.EMAIL]: false,
        },
        categoryPreferences: {
          [NotificationCategory.RESOURCES]: true,
          [NotificationCategory.KNOWLEDGE]: true,
          [NotificationCategory.PROJECTS]: true,
          [NotificationCategory.TAGS]: true,
          [NotificationCategory.CATEGORIES]: true,
          [NotificationCategory.DASHBOARD]: true,
          [NotificationCategory.SYSTEM]: true,
        },
        doNotDisturb: false,
      });
      
      await preferences.save();
    }
    
    return preferences;
  }

  // Actualizar firma para permitir null como retorno
  async createNotificationFromActivity(
    peopleId: Types.ObjectId,
    action: ActivityAction,
    entityType: EntityType,
    entityId: Types.ObjectId,
    entityTitle: string,
    details?: Record<string, any>
  ): Promise<NotificationDocument | null> {
    // Verificar preferencias antes de generar notificación
    const preferences = await this.getOrCreatePreferences(peopleId);
    
    if (!preferences.enabled) {
      return null;
    }
    
    // Mapear tipo de entidad a categoría
    let category: NotificationCategory;
    switch (entityType) {
      case EntityType.RESOURCE:
        category = NotificationCategory.RESOURCES;
        break;
      case EntityType.KNOWLEDGE_ITEM:
        category = NotificationCategory.KNOWLEDGE;
        break;
      case EntityType.PROJECT:
        category = NotificationCategory.PROJECTS;
        break;
      case EntityType.TAG:
        category = NotificationCategory.TAGS;
        break;
      case EntityType.CATEGORY:
        category = NotificationCategory.CATEGORIES;
        break;
      case EntityType.DASHBOARD:
        category = NotificationCategory.DASHBOARD;
        break;
      default:
        category = NotificationCategory.SYSTEM;
    }
    
    // Verificar si esa categoría está habilitada
    if (preferences.categoryPreferences[category] === false) {
      return null;
    }
    
    // Definir título y mensaje según acción y entidad
    let title = '';
    let message = '';
    let type = NotificationType.INFO;
    
    switch (action) {
      case ActivityAction.CREATE:
        title = `Nuevo ${this.getEntityName(entityType)} creado`;
        message = `El ${this.getEntityName(entityType)} "${entityTitle}" ha sido creado exitosamente.`;
        type = NotificationType.SUCCESS;
        break;
      case ActivityAction.UPDATE:
        title = `${this.getEntityName(entityType)} actualizado`;
        message = `El ${this.getEntityName(entityType)} "${entityTitle}" ha sido actualizado.`;
        type = NotificationType.INFO;
        break;
      case ActivityAction.DELETE:
        title = `${this.getEntityName(entityType)} eliminado`;
        message = `El ${this.getEntityName(entityType)} "${entityTitle}" ha sido eliminado.`;
        type = NotificationType.WARNING;
        break;
      default:
        // No generar notificación para otras acciones
        return null;
    }
    
    // Crear la notificación
    return this.create(peopleId, {
      title,
      message,
      type,
      relatedEntityType: entityType,
      relatedEntityId: entityId,
      additionalData: details || {},
      // Expirar en 7 días
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  private getEntityName(entityType: EntityType): string {
    switch (entityType) {
      case EntityType.RESOURCE:
        return 'recurso';
      case EntityType.KNOWLEDGE_ITEM:
        return 'elemento de conocimiento';
      case EntityType.PROJECT:
        return 'proyecto';
      case EntityType.TAG:
        return 'etiqueta';
      case EntityType.CATEGORY:
        return 'categoría';
      case EntityType.DASHBOARD:
        return 'dashboard';
      default:
        return 'elemento';
    }
  }
}