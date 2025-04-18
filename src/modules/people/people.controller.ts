// src/modules/people/people.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Put, 
    Delete, 
    UseGuards,
    Query
  } from '@nestjs/common';
  import { PeopleService } from './people.service';
  import { CreatePeopleDto } from './dto/create-people.dto';
  import { UpdatePeopleDto } from './dto/update-people.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard';
  
  @Controller('people')
  export class PeopleController {
    constructor(private readonly peopleService: PeopleService) {}
  
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createPeopleDto: CreatePeopleDto) {
      return this.peopleService.create(createPeopleDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Query() query: any) {
      return this.peopleService.findAll(query);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.peopleService.findOne(id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatePeopleDto: UpdatePeopleDto) {
      return this.peopleService.update(id, updatePeopleDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
      return this.peopleService.remove(id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('by-username/:username')
    async findByUsername(@Param('username') username: string) {
      return this.peopleService.findByUsername(username);
    }
  }
  