// src/modules/categories/categories.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { ActivityModule } from '../activity/activity.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CategoriesSeeder } from './categories.seed';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    ActivityModule,
    NotificationsModule,
    ConfigModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesSeeder],
  exports: [CategoriesService],
})
export class CategoriesModule implements OnModuleInit {
  constructor(private categoriesSeeder: CategoriesSeeder) {}

  async onModuleInit() {
    // Ejecutar el seeder al iniciar el módulo
    await this.categoriesSeeder.seed();
  }
}