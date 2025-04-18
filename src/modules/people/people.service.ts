// src/modules/people/people.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { People, PeopleDocument } from './schemas/people.schema';
import { CreatePeopleDto } from './dto/create-people.dto';
import { UpdatePeopleDto } from './dto/update-people.dto';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(People.name) private peopleModel: Model<PeopleDocument>,
  ) {}

  async create(createPeopleDto: CreatePeopleDto): Promise<People> {
    const createdPeople = new this.peopleModel({
      ...createPeopleDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return createdPeople.save();
  }

  async findAll(query?: any): Promise<People[]> {
    return this.peopleModel.find(query).exec();
  }

  async findOne(id: string): Promise<People> {
    const people = await this.peopleModel.findById(id).exec();
    if (!people) {
      throw new NotFoundException(`People with ID ${id} not found`);
    }
    return people;
  }

  async update(id: string, updatePeopleDto: UpdatePeopleDto): Promise<People> {
    const updatedPeople = await this.peopleModel
      .findByIdAndUpdate(
        id, 
        { ...updatePeopleDto, updatedAt: new Date() }, 
        { new: true }
      )
      .exec();
    
    if (!updatedPeople) {
      throw new NotFoundException(`People with ID ${id} not found`);
    }
    
    return updatedPeople;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.peopleModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`People with ID ${id} not found`);
    }
    return true;
  }

  async findByUsername(username: string): Promise<People> {
    const people = await this.peopleModel.findOne({ username }).exec();
    if (!people) {
      throw new NotFoundException(`People with username ${username} not found`);
    }
    return people;
  }
}