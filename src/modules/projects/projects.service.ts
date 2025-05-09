// src/modules/projects/projects.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { ProjectResource, ProjectResourceDocument } from './schemas/project-resource.schema';
import { ProjectKnowledge, ProjectKnowledgeDocument } from './schemas/project-knowledge.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { ProjectResourceDto } from './dto/project-resource.dto';
import { ProjectKnowledgeDto } from './dto/project-knowledge.dto';
import { TagsService } from '../tags/tags.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, EntityType } from '../activity/schemas/activity.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectResource.name) private projectResourceModel: Model<ProjectResourceDocument>,
    @InjectModel(ProjectKnowledge.name) private projectKnowledgeModel: Model<ProjectKnowledgeDocument>,
    private tagsService: TagsService,
    private activityService: ActivityService
  ) {}

  async create(createProjectDto: CreateProjectDto, peopleId: Types.ObjectId): Promise<ProjectDocument> {
    const createdProject = new this.projectModel({
      ...createProjectDto,
      peopleId,
    });
    
    // Procesar las etiquetas si existen
    if (createProjectDto.tags && createProjectDto.tags.length > 0) {
      await this.processAndSaveTags(createProjectDto.tags, peopleId);
    }
    
    const savedProject = await createdProject.save();
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.CREATE,
      EntityType.PROJECT,
      new Types.ObjectId(savedProject._id as string),
      { status: savedProject.status },
      savedProject.name,
      savedProject.tags || []
    );
    
    return savedProject;
  }

  async findAll(peopleId: Types.ObjectId, filterDto?: FilterProjectsDto): Promise<ProjectDocument[]> {
    const query: any = { peopleId };

    if (filterDto) {
      if (filterDto.search) {
        query.$or = [
          { name: { $regex: filterDto.search, $options: 'i' } },
          { description: { $regex: filterDto.search, $options: 'i' } },
        ];
      }

      if (filterDto.status && filterDto.status.length > 0) {
        query.status = { $in: filterDto.status };
      }

      if (filterDto.tags && filterDto.tags.length > 0) {
        query.tags = { $in: filterDto.tags };
      }

      if (filterDto.memberId) {
        query.members = filterDto.memberId;
      }

      if (filterDto.startDateFrom || filterDto.startDateTo) {
        query.startDate = {};
        if (filterDto.startDateFrom) {
          query.startDate.$gte = new Date(filterDto.startDateFrom);
        }
        if (filterDto.startDateTo) {
          query.startDate.$lte = new Date(filterDto.startDateTo);
        }
      }

      if (filterDto.endDateFrom || filterDto.endDateTo) {
        query.endDate = {};
        if (filterDto.endDateFrom) {
          query.endDate.$gte = new Date(filterDto.endDateFrom);
        }
        if (filterDto.endDateTo) {
          query.endDate.$lte = new Date(filterDto.endDateTo);
        }
      }
    }

    return this.projectModel.find(query).exec();
  }

  async findOne(id: string, peopleId: Types.ObjectId): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    // Registrar la actividad de vista
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.VIEW,
      EntityType.PROJECT,
      new Types.ObjectId(project._id as string),
      { status: project.status },
      project.name,
      project.tags || []
    );
    
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, peopleId: Types.ObjectId): Promise<ProjectDocument> {
    // Procesar las etiquetas si existen
    if (updateProjectDto.tags && updateProjectDto.tags.length > 0) {
      await this.processAndSaveTags(updateProjectDto.tags, peopleId);
    }
    
    const updatedProject = await this.projectModel.findOneAndUpdate(
      { _id: id, peopleId },
      { $set: updateProjectDto },
      { new: true },
    ).exec();
    
    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.PROJECT,
      new Types.ObjectId(updatedProject._id as string),
      { status: updatedProject.status },
      updatedProject.name,
      updatedProject.tags || []
    );
    
    return updatedProject;
  }

  async remove(id: string, peopleId: Types.ObjectId): Promise<ProjectDocument> {
    // Primero verificamos que el proyecto existe
    const project = await this.findOne(id, peopleId);
    
    // Eliminamos las relaciones de recursos
    await this.projectResourceModel.deleteMany({ projectId: new Types.ObjectId(id) }).exec();
    
    // Eliminamos las relaciones de conocimientos
    await this.projectKnowledgeModel.deleteMany({ projectId: new Types.ObjectId(id) }).exec();
    
    // Finalmente eliminamos el proyecto
    const deletedProject = await this.projectModel.findOneAndDelete({ 
      _id: id, 
      peopleId 
    }).exec();
    
    if (!deletedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.DELETE,
      EntityType.PROJECT,
      new Types.ObjectId(id),
      { status: project.status },
      project.name,
      project.tags || []
    );
    
    return deletedProject;
  }

  // Relaciones con recursos
  async addResource(
    projectId: string, 
    projectResourceDto: ProjectResourceDto, 
    peopleId: Types.ObjectId
  ): Promise<ProjectResourceDocument> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.findOne(projectId, peopleId);
    
    // Verificar si ya existe la relación
    const existingRelation = await this.projectResourceModel.findOne({
      projectId: new Types.ObjectId(projectId),
      resourceId: projectResourceDto.resourceId,
    }).exec();
    
    if (existingRelation) {
      // Si ya existe, actualizamos las notas
      if (projectResourceDto.notes !== undefined) {
        existingRelation.notes = projectResourceDto.notes;
        const savedRelation = await existingRelation.save();
        
        // Registrar la actividad
        await this.activityService.trackActivity(
          peopleId,
          ActivityAction.UPDATE,
          EntityType.PROJECT,
          new Types.ObjectId(projectId),
          { 
            action: 'updateResourceNotes',
            resourceId: projectResourceDto.resourceId.toString()
          },
          project.name
        );
        
        return savedRelation;
      }
      return existingRelation;
    }
    
    // Si no existe, creamos la relación
    const newProjectResource = new this.projectResourceModel({
      projectId: new Types.ObjectId(projectId),
      resourceId: projectResourceDto.resourceId,
      notes: projectResourceDto.notes || '',
    });
    
    const savedRelation = await newProjectResource.save();
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.PROJECT,
      new Types.ObjectId(projectId),
      { 
        action: 'addResource',
        resourceId: projectResourceDto.resourceId.toString()
      },
      project.name
    );
    
    return savedRelation;
  }

  async removeResource(
    projectId: string, 
    resourceId: string, 
    peopleId: Types.ObjectId
  ): Promise<boolean> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.findOne(projectId, peopleId);
    
    const result = await this.projectResourceModel.deleteOne({
      projectId: new Types.ObjectId(projectId),
      resourceId: new Types.ObjectId(resourceId),
    }).exec();
    
    // Registrar la actividad solo si se eliminó algo
    if (result.deletedCount > 0) {
      await this.activityService.trackActivity(
        peopleId,
        ActivityAction.UPDATE,
        EntityType.PROJECT,
        new Types.ObjectId(projectId),
        { 
          action: 'removeResource',
          resourceId: resourceId
        },
        project.name
      );
    }
    
    return result.deletedCount > 0;
  }

  async getProjectResources(projectId: string, peopleId: Types.ObjectId): Promise<ProjectResourceDocument[]> {
    // Verificar que el proyecto existe y pertenece al usuario
    await this.findOne(projectId, peopleId);
    
    return this.projectResourceModel.find({
      projectId: new Types.ObjectId(projectId),
    }).exec();
  }

  // Relaciones con elementos de conocimiento
  async addKnowledgeItem(
    projectId: string, 
    projectKnowledgeDto: ProjectKnowledgeDto, 
    peopleId: Types.ObjectId
  ): Promise<ProjectKnowledgeDocument> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.findOne(projectId, peopleId);
    
    // Verificar si ya existe la relación
    const existingRelation = await this.projectKnowledgeModel.findOne({
      projectId: new Types.ObjectId(projectId),
      knowledgeItemId: projectKnowledgeDto.knowledgeItemId,
    }).exec();
    
    if (existingRelation) {
      // Si ya existe, actualizamos las notas
      if (projectKnowledgeDto.notes !== undefined) {
        existingRelation.notes = projectKnowledgeDto.notes;
        const savedRelation = await existingRelation.save();
        
        // Registrar la actividad
        await this.activityService.trackActivity(
          peopleId,
          ActivityAction.UPDATE,
          EntityType.PROJECT,
          new Types.ObjectId(projectId),
          { 
            action: 'updateKnowledgeNotes',
            knowledgeItemId: projectKnowledgeDto.knowledgeItemId.toString()
          },
          project.name
        );
        
        return savedRelation;
      }
      return existingRelation;
    }
    
    // Si no existe, creamos la relación
    const newProjectKnowledge = new this.projectKnowledgeModel({
      projectId: new Types.ObjectId(projectId),
      knowledgeItemId: projectKnowledgeDto.knowledgeItemId,
      notes: projectKnowledgeDto.notes || '',
    });
    
    const savedRelation = await newProjectKnowledge.save();
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.PROJECT,
      new Types.ObjectId(projectId),
      { 
        action: 'addKnowledgeItem',
        knowledgeItemId: projectKnowledgeDto.knowledgeItemId.toString()
      },
      project.name
    );
    
    return savedRelation;
  }

  async removeKnowledgeItem(
    projectId: string, 
    knowledgeItemId: string, 
    peopleId: Types.ObjectId
  ): Promise<boolean> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.findOne(projectId, peopleId);
    
    const result = await this.projectKnowledgeModel.deleteOne({
      projectId: new Types.ObjectId(projectId),
      knowledgeItemId: new Types.ObjectId(knowledgeItemId),
    }).exec();
    
    // Registrar la actividad solo si se eliminó algo
    if (result.deletedCount > 0) {
      await this.activityService.trackActivity(
        peopleId,
        ActivityAction.UPDATE,
        EntityType.PROJECT,
        new Types.ObjectId(projectId),
        { 
          action: 'removeKnowledgeItem',
          knowledgeItemId: knowledgeItemId
        },
        project.name
      );
    }
    
    return result.deletedCount > 0;
  }

  async getProjectKnowledgeItems(projectId: string, peopleId: Types.ObjectId): Promise<ProjectKnowledgeDocument[]> {
    // Verificar que el proyecto existe y pertenece al usuario
    await this.findOne(projectId, peopleId);
    
    return this.projectKnowledgeModel.find({
      projectId: new Types.ObjectId(projectId),
    }).exec();
  }

  // Miembros del proyecto
  async addMember(
    projectId: string, 
    memberId: string, 
    peopleId: Types.ObjectId
  ): Promise<ProjectDocument> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.findOne(projectId, peopleId);
    
    // Verificar que el miembro no es el propio propietario
    if (memberId === peopleId.toString()) {
      throw new BadRequestException('Cannot add project owner as member');
    }
    
    // Añadir miembro si no existe ya
    const updatedProject = await this.projectModel.findOneAndUpdate(
      { _id: projectId, peopleId },
      { $addToSet: { members: new Types.ObjectId(memberId) } },
      { new: true },
    ).exec();
    
    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.PROJECT,
      new Types.ObjectId(projectId),
      { 
        action: 'addMember',
        memberId: memberId
      },
      project.name
    );
    
    return updatedProject;
  }

  async removeMember(
    projectId: string, 
    memberId: string, 
    peopleId: Types.ObjectId
  ): Promise<ProjectDocument> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.findOne(projectId, peopleId);
    
    // Eliminar miembro
    const updatedProject = await this.projectModel.findOneAndUpdate(
      { _id: projectId, peopleId },
      { $pull: { members: new Types.ObjectId(memberId) } },
      { new: true },
    ).exec();
    
    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    
    // Registrar la actividad
    await this.activityService.trackActivity(
      peopleId,
      ActivityAction.UPDATE,
      EntityType.PROJECT,
      new Types.ObjectId(projectId),
      { 
        action: 'removeMember',
        memberId: memberId
      },
      project.name
    );
    
    return updatedProject;
  }

  // Utilidades
  async processAndSaveTags(tags: string[], peopleId: Types.ObjectId): Promise<void> {
    if (!tags || tags.length === 0) {
      return;
    }
    
    await this.tagsService.bulkCreateOrUpdate(tags, peopleId);
  }
}