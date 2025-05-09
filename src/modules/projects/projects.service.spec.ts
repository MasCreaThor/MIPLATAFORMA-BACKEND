// src/modules/projects/projects.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProjectsService } from './projects.service';
import { Project, ProjectDocument, ProjectStatus } from './schemas/project.schema';
import { ProjectResource, ProjectResourceDocument } from './schemas/project-resource.schema';
import { ProjectKnowledge, ProjectKnowledgeDocument } from './schemas/project-knowledge.schema';
import { TagsService } from '../tags/tags.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockProject = {
  _id: new Types.ObjectId(),
  name: 'Test Project',
  description: 'Test description',
  status: ProjectStatus.ACTIVE,
  startDate: new Date(),
  peopleId: new Types.ObjectId(),
  members: [],
  tags: ['test', 'project'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectModel: Model<ProjectDocument>;
  let projectResourceModel: Model<ProjectResourceDocument>;
  let projectKnowledgeModel: Model<ProjectKnowledgeDocument>;
  let tagsService: TagsService;

  const mockProjectModel = {
    new: jest.fn().mockResolvedValue(mockProject),
    constructor: jest.fn().mockResolvedValue(mockProject),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  const mockProjectResourceModel = {
    new: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn(),
    deleteOne: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  const mockProjectKnowledgeModel = {
    new: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn(),
    deleteOne: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  const mockTagsService = {
    bulkCreateOrUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: mockProjectModel,
        },
        {
          provide: getModelToken(ProjectResource.name),
          useValue: mockProjectResourceModel,
        },
        {
          provide: getModelToken(ProjectKnowledge.name),
          useValue: mockProjectKnowledgeModel,
        },
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectModel = module.get<Model<ProjectDocument>>(getModelToken(Project.name));
    projectResourceModel = module.get<Model<ProjectResourceDocument>>(getModelToken(ProjectResource.name));
    projectKnowledgeModel = module.get<Model<ProjectKnowledgeDocument>>(getModelToken(ProjectKnowledge.name));
    tagsService = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const peopleId = new Types.ObjectId();
      const mockProjects = [mockProject];
      
      jest.spyOn(projectModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockProjects),
      } as any);

      const result = await service.findAll(peopleId);
      
      expect(result).toEqual(mockProjects);
      expect(projectModel.find).toHaveBeenCalledWith({ peopleId });
    });
  });

  describe('findOne', () => {
    it('should return a project if found', async () => {
      const peopleId = new Types.ObjectId();
      const id = mockProject._id.toString();
      
      jest.spyOn(projectModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockProject),
      } as any);

      const result = await service.findOne(id, peopleId);
      
      expect(result).toEqual(mockProject);
      expect(projectModel.findOne).toHaveBeenCalledWith({ _id: id, peopleId });
    });

    it('should throw NotFoundException if project not found', async () => {
      const peopleId = new Types.ObjectId();
      const id = new Types.ObjectId().toString();
      
      jest.spyOn(projectModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne(id, peopleId)).rejects.toThrow(NotFoundException);
    });
  });

  // Additional tests would be added for other methods
});