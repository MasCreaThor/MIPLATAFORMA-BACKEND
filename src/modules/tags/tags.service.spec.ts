// src/modules/tags/tags.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TagsService } from './tags.service';
import { Tag, TagDocument } from './schemas/tag.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockTag = {
  _id: new Types.ObjectId(),
  name: 'Test Tag',
  description: 'Test description',
  color: '#3B82F6',
  peopleId: new Types.ObjectId(),
  usageCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TagsService', () => {
  let service: TagsService;
  let model: Model<TagDocument>;

  const mockTagModel = {
    new: jest.fn().mockResolvedValue(mockTag),
    constructor: jest.fn().mockResolvedValue(mockTag),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getModelToken(Tag.name),
          useValue: mockTagModel,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    model = module.get<Model<TagDocument>>(getModelToken(Tag.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const peopleId = new Types.ObjectId();
      const createTagDto = { name: 'New Tag', description: 'New description' };
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);
      
      jest.spyOn(mockTagModel, 'save').mockResolvedValueOnce(mockTag);
      
      const newTag = {
        ...createTagDto,
        peopleId,
        save: mockTagModel.save,
      };
      
      jest.spyOn(model, 'create').mockReturnValue(newTag as any);

      const result = await service.create(createTagDto, peopleId);
      
      expect(model.findOne).toHaveBeenCalledWith({
        name: createTagDto.name,
        peopleId,
      });
      
      expect(result).toEqual(mockTag);
    });

    it('should throw ConflictException if tag name already exists', async () => {
      const peopleId = new Types.ObjectId();
      const createTagDto = { name: 'Existing Tag' };
      
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockTag),
      } as any);

      await expect(service.create(createTagDto, peopleId)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all tags for a user', async () => {
      const peopleId = new Types.ObjectId();
      const mockTags = [mockTag];
      
      jest.spyOn(model, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockTags),
      } as any);

      const result = await service.findAll(peopleId);
      
      expect(result).toEqual(mockTags);
      expect(model.find).toHaveBeenCalledWith({ peopleId });
    });

    it('should apply filters when provided', async () => {
      const peopleId = new Types.ObjectId();
      const filterDto = { search: 'test', minUsageCount: 5, popular: true, limit: 10 };
      const mockTags = [mockTag];
      
      jest.spyOn(model, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockTags),
      } as any);

      const result = await service.findAll(peopleId, filterDto);
      
      expect(result).toEqual(mockTags);
      expect(model.find).toHaveBeenCalledWith({
        peopleId,
        $or: [
          { name: { $regex: filterDto.search, $options: 'i' } },
          { description: { $regex: filterDto.search, $options: 'i' } },
        ],
        usageCount: { $gte: filterDto.minUsageCount },
      });
    });
  });

  // Additional tests would be added for other methods
});