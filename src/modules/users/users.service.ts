// src/modules/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { People, PeopleDocument } from './schemas/people.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePeopleDto } from './dto/create-people.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(People.name) private peopleModel: Model<PeopleDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const objectId = this.toObjectId(id);
    const user = await this.userModel.findById(objectId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    const people = await this.peopleModel.findOne({ email }).exec();
    if (!people) {
      return null;
    }
    return this.userModel.findOne({ peopleId: people._id }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async createPeople(createPeopleDto: CreatePeopleDto): Promise<People> {
    const newPeople = new this.peopleModel(createPeopleDto);
    return newPeople.save();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const objectId = this.toObjectId(id);
    const updatedUser = await this.userModel
      .findByIdAndUpdate(objectId, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async updateLastLogin(id: string): Promise<User> {
    const objectId = this.toObjectId(id);
    const updatedUser = await this.userModel
      .findByIdAndUpdate(objectId, { lastLogin: new Date() }, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const objectId = this.toObjectId(id);
    const deletedUser = await this.userModel.findByIdAndDelete(objectId).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }

  private toObjectId(id: string): Types.ObjectId {
    try {
      return new Types.ObjectId(id);
    } catch (error) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }
  }
}