// src/modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { 
  NotificationPreference, 
  NotificationPreferenceSchema 
} from './schemas/notification-preference.schema';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationPreference.name, schema: NotificationPreferenceSchema },
    ]),
    ActivityModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}