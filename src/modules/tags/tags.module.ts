// src/modules/tags/tags.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag, TagSchema } from './schemas/tag.schema';
import { ActivityModule } from '../activity/activity.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
    ]),
    ActivityModule,
    NotificationsModule,
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}