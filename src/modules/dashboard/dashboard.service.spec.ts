// src/modules/dashboard/dashboard.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardConfig, DashboardConfigDocument, WidgetType } from './schemas/dashboard-config.schema';
import { NotFoundException } from '@nestjs/common';

const mockDashboardConfig = {
  _id: new Types.ObjectId(),
  peopleId: new Types.ObjectId(),
  widgets: [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: WidgetType.RECENT_RESOURCES,
      title: 'Recent Resources',
      configuration: { limit: 5 },
      position: { x: 0, y: 0, width: 6, height: 2 },
    }
  ],
  layout: { columns: 12, rowHeight: 100 },
  theme: 'default',
  save: jest.fn().mockResolvedValue(this),
};

describe('DashboardService', () => {
  let service: DashboardService;
  let dashboardConfigModel: Model<DashboardConfigDocument>;
  let resourceModel: Model<any>;
  let knowledgeItemModel: Model<any>;
  let projectModel: Model<any>;
  let tagModel: Model<any>;

  const mockDashboardConfigModel = {
    findOne: jest.fn(),
    new: jest.fn().mockResolvedValue(mockDashboardConfig),
    exec: jest.fn(),
  };

  const mockResourceModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    exec: jest.fn(),
  };

  const mockKnowledgeItemModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    exec: jest.fn(),
  };

  const mockProjectModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    exec: jest.fn(),
  };

  const mockTagModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(DashboardConfig.name),
          useValue: mockDashboardConfigModel,
        },
        {
          provide: getModelToken('Resource'),
          useValue: mockResourceModel,
        },
        {
          provide: getModelToken('KnowledgeItem'),
          useValue: mockKnowledgeItemModel,
        },
        {
          provide: getModelToken('Project'),
          useValue: mockProjectModel,
        },
        {
          provide: getModelToken('Tag'),
          useValue: mockTagModel,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    dashboardConfigModel = module.get<Model<DashboardConfigDocument>>(getModelToken(DashboardConfig.name));
    resourceModel = module.get<Model<any>>(getModelToken('Resource'));
    knowledgeItemModel = module.get<Model<any>>(getModelToken('KnowledgeItem'));
    projectModel = module.get<Model<any>>(getModelToken('Project'));
    tagModel = module.get<Model<any>>(getModelToken('Tag'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateDashboardConfig', () => {
    it('should return existing dashboard config if found', async () => {
      const peopleId = new Types.ObjectId();
      
      jest.spyOn(dashboardConfigModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDashboardConfig),
      } as any);

      const result = await service.getOrCreateDashboardConfig(peopleId);
      
      expect(result).toEqual(mockDashboardConfig);
      expect(dashboardConfigModel.findOne).toHaveBeenCalledWith({ peopleId });
    });

    // Additional test cases would be added here
  });

  // More test blocks would be added for other methods
});