// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PeopleService } from '../people/people.service';
import { PeopleDocument } from '../people/schemas/people.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private peopleService: PeopleService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create People record first
    const people = await this.peopleService.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      personalEmail: createUserDto.email,
      username: createUserDto.email.split('@')[0],
      isActive: true,
      roles: ['user'],
    });

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Create and save user with reference to people
    const createdUser = new this.userModel({
      email: createUserDto.email,
      password: hashedPassword,
      peopleId: (people as PeopleDocument).id || (people as any)._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const savedUser = await createdUser.save();
    
    // Return user without password
    const userObject = savedUser.toObject();
    // Crear un nuevo objeto sin la propiedad password
    const { password, ...userWithoutPassword } = userObject;
    
    return {
      ...userWithoutPassword,
      profile: people
    };
  }

  async findAll(query?: any): Promise<User[]> {
    return this.userModel.find(query).select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findWithPassword(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id, 
        { ...updateUserDto, updatedAt: new Date() }, 
        { new: true }
      )
      .select('-password')
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Delete associated people record
    if (user.peopleId) {
      await this.peopleService.remove(user.peopleId.toString());
    }
    
    // Delete user
    await this.userModel.deleteOne({ _id: id }).exec();
    
    return true;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }
}