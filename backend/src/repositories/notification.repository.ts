import { BaseRepository } from './base.repository';
import { Notification, INotification } from '@models/Notification.model';

class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  markAllRead(recipientId: string) {
    return this.model.updateMany({ recipientId, isRead: false }, { $set: { isRead: true } }).exec();
  }
}

export const notificationRepository = new NotificationRepository();
