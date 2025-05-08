// src/modules/knowledge/knowledge.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeItem, KnowledgeItemDocument, KnowledgeItemType } from './schemas/knowledge-item.schema';
import { NotFoundException } from '@nestjs/common';

const mockKnowledgeItem = {
  _id: new Types.ObjectId(),
  title: 'Test Knowledge Item',
  type: KnowledgeItemType.NOTE,
  content: 'Test content',
  peopleId: new Types.ObjectId(),
  isPublic: false,
  usageCount: 0,
  tags: ['test', 'note'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let model: Model<KnowledgeItemDocument>;

  const mockKnowledgeItemModel = {
    new: jest.fn().mockResolvedValue(mockKnowledgeItem),
    constructor: jest.fn().mockResolvedValue(mockKnowledgeItem),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        {
          provide: getModelToken(KnowledgeItem.name),
          useValue: mockKnowledgeItemModel,
        },
      ],
    }).compile();

    service = module.get<KnowledgeService>(KnowledgeService);
    model = module.get<Model<KnowledgeItemDocument>>(getModelToken(KnowledgeItem.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of knowledge items', async () => {
      const peopleId = new Types.ObjectId();
      const mockItems = [mockKnowledgeItem];
      
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockItems),
      } as any);

      const result = await service.findAll(peopleId);
      expect(result).toEqual(mockItems);
      expect(model.find).toHaveBeenCalledWith({ peopleId });
    });
  });

  describe('findOne', () => {
    it('should return a knowledge item if found', async () => {
      const peopleId = new Types.ObjectId();
      const id = mockKnowledgeItem._id.toString();
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockKnowledgeItem),
      } as any);

      const result = await service.findOne(id, peopleId);
      expect(result).toEqual(mockKnowledgeItem);
      expect(model.findOne).toHaveBeenCalledWith({ _id: id, peopleId });
    });

    it('should throw NotFoundException if knowledge item not found', async () => {
      const peopleId = new Types.ObjectId();
      const id = new Types.ObjectId().toString();
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne(id, peopleId)).rejects.toThrow(NotFoundException);
    });
  });

  // Additional tests would be added for create, update, remove, etc.
});