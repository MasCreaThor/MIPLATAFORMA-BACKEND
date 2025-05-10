// src/modules/projects/projects.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { ProjectsService } from './projects.service';
  import { CreateProjectDto } from './dto/create-project.dto';
  import { UpdateProjectDto } from './dto/update-project.dto';
  import { FilterProjectsDto } from './dto/filter-projects.dto';
  import { ProjectResourceDto } from './dto/project-resource.dto';
  import { ProjectKnowledgeDto } from './dto/project-knowledge.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard';
  import { Types } from 'mongoose';
  
  @Controller('projects')
  @UseGuards(JwtAuthGuard)
  export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}
  
    @Post()
    create(@Body() createProjectDto: CreateProjectDto) {
      // Temporalmente usando un ID ficticio para peopleId
      // En producción esto vendría del token de autenticación
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.create(createProjectDto, mockPeopleId);
    }
  
    @Get()
    findAll(@Query() filterDto: FilterProjectsDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.findAll(mockPeopleId, filterDto);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.findOne(id, mockPeopleId);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.update(id, updateProjectDto, mockPeopleId);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.remove(id, mockPeopleId);
    }
  
    // Resources
    @Post(':id/resources')
    addResource(
      @Param('id') id: string, 
      @Body() projectResourceDto: ProjectResourceDto
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.addResource(id, projectResourceDto, mockPeopleId);
    }
  
    @Delete(':id/resources/:resourceId')
    removeResource(
      @Param('id') id: string,
      @Param('resourceId') resourceId: string
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.removeResource(id, resourceId, mockPeopleId);
    }
  
    @Get(':id/resources')
    getProjectResources(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.getProjectResources(id, mockPeopleId);
    }
  
    // Knowledge Items
    @Post(':id/knowledge')
    addKnowledgeItem(
      @Param('id') id: string, 
      @Body() projectKnowledgeDto: ProjectKnowledgeDto
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.addKnowledgeItem(id, projectKnowledgeDto, mockPeopleId);
    }
  
    @Delete(':id/knowledge/:knowledgeItemId')
    removeKnowledgeItem(
      @Param('id') id: string,
      @Param('knowledgeItemId') knowledgeItemId: string
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.removeKnowledgeItem(id, knowledgeItemId, mockPeopleId);
    }
  
    @Get(':id/knowledge')
    getProjectKnowledgeItems(@Param('id') id: string) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.getProjectKnowledgeItems(id, mockPeopleId);
    }
  
    // Members
    @Post(':id/members/:memberId')
    addMember(
      @Param('id') id: string,
      @Param('memberId') memberId: string
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.addMember(id, memberId, mockPeopleId);
    }
  
    @Delete(':id/members/:memberId')
    removeMember(
      @Param('id') id: string,
      @Param('memberId') memberId: string
    ) {
      // Temporalmente usando un ID ficticio para peopleId
      const mockPeopleId = new Types.ObjectId();
      return this.projectsService.removeMember(id, memberId, mockPeopleId);
    }
  }