// src/modules/dashboard/dashboard.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { 
  DashboardConfig, 
  DashboardConfigDocument, 
  Widget, 
  WidgetType 
} from './schemas/dashboard-config.schema';
import { UpdateDashboardConfigDto } from './dto/update-dashboard-config.dto';
import { AddWidgetDto, UpdateWidgetDto } from './dto/widget.dto';
import { DashboardStatsDto, TimeSeriesData, RecentActivityData } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(DashboardConfig.name) private dashboardConfigModel: Model<DashboardConfigDocument>,
    @InjectModel('Resource') private resourceModel: Model<any>,
    @InjectModel('KnowledgeItem') private knowledgeItemModel: Model<any>,
    @InjectModel('Project') private projectModel: Model<any>,
    @InjectModel('Tag') private tagModel: Model<any>,
  ) {}

  async getOrCreateDashboardConfig(peopleId: Types.ObjectId): Promise<DashboardConfigDocument> {
    // Check if config exists
    const dashboardConfig = await this.dashboardConfigModel.findOne({
      peopleId,
    }).exec();
    
    // If not found, create default config
    if (!dashboardConfig) {
      return this.createDefaultDashboardConfig(peopleId);
    }
    
    return dashboardConfig;
  }

  private async createDefaultDashboardConfig(peopleId: Types.ObjectId): Promise<DashboardConfigDocument> {
    // Create a default dashboard configuration
    const defaultWidgets: Widget[] = [
      {
        id: uuidv4(),
        type: WidgetType.RECENT_RESOURCES,
        title: 'Recent Resources',
        configuration: { limit: 5 },
        position: { x: 0, y: 0, width: 6, height: 2 },
      },
      {
        id: uuidv4(),
        type: WidgetType.RECENT_KNOWLEDGE,
        title: 'Recent Knowledge Items',
        configuration: { limit: 5 },
        position: { x: 6, y: 0, width: 6, height: 2 },
      },
      {
        id: uuidv4(),
        type: WidgetType.ACTIVE_PROJECTS,
        title: 'Active Projects',
        configuration: { limit: 3 },
        position: { x: 0, y: 2, width: 4, height: 3 },
      },
      {
        id: uuidv4(),
        type: WidgetType.POPULAR_TAGS,
        title: 'Popular Tags',
        configuration: { limit: 10 },
        position: { x: 4, y: 2, width: 4, height: 3 },
      },
      {
        id: uuidv4(),
        type: WidgetType.USAGE_STATS,
        title: 'Usage Statistics',
        configuration: { period: 'month' },
        position: { x: 8, y: 2, width: 4, height: 3 },
      },
    ];
    
    const newDashboardConfig = new this.dashboardConfigModel({
      peopleId,
      widgets: defaultWidgets,
      layout: { columns: 12, rowHeight: 100 },
      theme: 'default',
    });
    
    return newDashboardConfig.save();
  }

  async updateDashboardConfig(peopleId: Types.ObjectId, updateDto: UpdateDashboardConfigDto): Promise<DashboardConfigDocument> {
    const dashboardConfig = await this.getOrCreateDashboardConfig(peopleId);
    
    // Update only provided fields
    if (updateDto.widgets !== undefined) {
      // Ensure each widget has the required configuration property
      dashboardConfig.widgets = updateDto.widgets.map(widget => ({
        ...widget,
        id: widget.id || uuidv4(), // Ensure each widget has an ID
        configuration: widget.configuration || {}, // Ensure configuration is never undefined
      }));
    }
    
    if (updateDto.layout !== undefined) {
      dashboardConfig.layout = updateDto.layout;
    }
    
    if (updateDto.theme !== undefined) {
      dashboardConfig.theme = updateDto.theme;
    }
    
    return dashboardConfig.save();
  }

  async addWidget(peopleId: Types.ObjectId, addWidgetDto: AddWidgetDto): Promise<DashboardConfigDocument> {
    const dashboardConfig = await this.getOrCreateDashboardConfig(peopleId);
    
    // Create new widget with generated ID
    const newWidget: Widget = {
      id: uuidv4(),
      type: addWidgetDto.type,
      title: addWidgetDto.title,
      configuration: addWidgetDto.configuration || {}, // Ensure configuration is not undefined
      position: addWidgetDto.position,
    };
    
    // Add widget to the configuration
    dashboardConfig.widgets.push(newWidget);
    
    return dashboardConfig.save();
  }

  async updateWidget(
    peopleId: Types.ObjectId, 
    widgetId: string, 
    updateWidgetDto: UpdateWidgetDto
  ): Promise<DashboardConfigDocument> {
    const dashboardConfig = await this.getOrCreateDashboardConfig(peopleId);
    
    // Find the widget index
    const widgetIndex = dashboardConfig.widgets.findIndex(widget => widget.id === widgetId);
    
    if (widgetIndex === -1) {
      throw new NotFoundException(`Widget with ID ${widgetId} not found`);
    }
    
    // Update widget properties
    dashboardConfig.widgets[widgetIndex] = {
      ...dashboardConfig.widgets[widgetIndex],
      ...updateWidgetDto,
      // Ensure configuration is not undefined if it's being updated
      configuration: updateWidgetDto.configuration !== undefined 
        ? updateWidgetDto.configuration 
        : dashboardConfig.widgets[widgetIndex].configuration,
    };
    
    return dashboardConfig.save();
  }

  async removeWidget(peopleId: Types.ObjectId, widgetId: string): Promise<DashboardConfigDocument> {
    const dashboardConfig = await this.getOrCreateDashboardConfig(peopleId);
    
    // Remove widget
    dashboardConfig.widgets = dashboardConfig.widgets.filter(widget => widget.id !== widgetId);
    
    return dashboardConfig.save();
  }

  async getDashboardStats(peopleId: Types.ObjectId): Promise<DashboardStatsDto> {
    // Collect statistics from various models
    
    // Get resource statistics
    const resources = await this.resourceModel.find({ peopleId }).exec();
    const resourceStats = {
      total: resources.length,
      documentation: resources.filter(r => r.type === 'documentation').length,
      tutorial: resources.filter(r => r.type === 'tutorial').length,
      link: resources.filter(r => r.type === 'link').length,
      file: resources.filter(r => r.type === 'file').length,
      video: resources.filter(r => r.type === 'video').length,
    };
    
    // Get knowledge item statistics
    const knowledgeItems = await this.knowledgeItemModel.find({ peopleId }).exec();
    const knowledgeStats = {
      total: knowledgeItems.length,
      wiki: knowledgeItems.filter(k => k.type === 'wiki').length,
      note: knowledgeItems.filter(k => k.type === 'note').length,
      snippet: knowledgeItems.filter(k => k.type === 'snippet').length,
      command: knowledgeItems.filter(k => k.type === 'command').length,
      solution: knowledgeItems.filter(k => k.type === 'solution').length,
    };
    
    // Get project statistics
    const projects = await this.projectModel.find({ peopleId }).exec();
    const projectStats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      archived: projects.filter(p => p.status === 'archived').length,
    };
    
    // Get tag statistics
    const tags = await this.tagModel.find({ peopleId }).sort({ usageCount: -1 }).limit(10).exec();
    const totalTags = await this.tagModel.countDocuments({ peopleId }).exec();
    
    // Prepare popular tags data
    const popularTags = tags.map(tag => ({
      name: tag.name,
      count: tag.usageCount,
    }));
    
    // Create activity timeline (last 30 days)
    const activityTimeline = this.generateActivityTimeline(
      [...resources, ...knowledgeItems, ...projects]
    );
    
    // Get recent activity (last 10 items)
    const recentActivity = this.generateRecentActivity(
      [...resources, ...knowledgeItems, ...projects]
    );
    
    return {
      resources: resourceStats,
      knowledge: knowledgeStats,
      projects: projectStats,
      totalTags,
      popularTags,
      activityTimeline,
      recentActivity,
    };
  }

  private generateActivityTimeline(items: any[]): TimeSeriesData[] {
    // Generate activity timeline for the last 30 days
    const result: TimeSeriesData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Count items created on this day
      const count = items.filter(item => {
        const createdAt = new Date(item.createdAt);
        return (
          createdAt.getDate() === date.getDate() &&
          createdAt.getMonth() === date.getMonth() &&
          createdAt.getFullYear() === date.getFullYear()
        );
      }).length;
      
      result.push({ date, count });
    }
    
    // Sort by date ascending
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private generateRecentActivity(items: any[]): RecentActivityData[] {
    // Sort all items by creation date descending
    const sortedItems = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Take the 10 most recent items
    return sortedItems.slice(0, 10).map(item => {
      let type = 'unknown';
      if (item.hasOwnProperty('content')) {
        type = 'knowledge';
      } else if (item.hasOwnProperty('url')) {
        type = 'resource';
      } else if (item.hasOwnProperty('status')) {
        type = 'project';
      }
      
      return {
        type,
        title: item.title || item.name,
        id: item._id.toString(),
        date: new Date(item.createdAt),
      };
    });
  }

  async getRecentItems(peopleId: Types.ObjectId, type: string, limit: number = 5): Promise<any[]> {
    let model;
    
    // Select the appropriate model based on type
    switch (type) {
      case 'resources':
        model = this.resourceModel;
        break;
      case 'knowledge':
        model = this.knowledgeItemModel;
        break;
      case 'projects':
        model = this.projectModel;
        break;
      default:
        throw new Error(`Invalid item type: ${type}`);
    }
    
    // Query the most recent items
    return model.find({ peopleId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getMostUsedItems(peopleId: Types.ObjectId, type: string, limit: number = 5): Promise<any[]> {
    let model;
    
    // Select the appropriate model based on type
    switch (type) {
      case 'resources':
        model = this.resourceModel;
        break;
      case 'knowledge':
        model = this.knowledgeItemModel;
        break;
      default:
        throw new Error(`Invalid item type: ${type}`);
    }
    
    // Query the most used items
    return model.find({ peopleId })
      .sort({ usageCount: -1 })
      .limit(limit)
      .exec();
  }
}