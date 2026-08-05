import { notificationRepository } from '@repositories/notification.repository';
import { NotificationType } from '@constants/enums';
import { emitToUser } from '@sockets/socket.handler';
import { getPagination, buildMeta } from '@utils/pagination.util';
import { Request } from 'express';

interface NotifyParams {
  organizationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  meta?: Record<string, unknown>;
}

export const notificationService = {
  async notify(params: NotifyParams) {
    const notification = await notificationRepository.create(params as any);
    // Real-time push over Socket.io; client also has the REST list as source of truth
    emitToUser(params.recipientId, 'notification:new', notification);
    return notification;
  },

  async notifyMany(recipientIds: string[], params: Omit<NotifyParams, 'recipientId'>) {
    return Promise.all(recipientIds.map((recipientId) => notificationService.notify({ ...params, recipientId })));
  },

  async list(req: Request, recipientId: string) {
    const { skip, limit, sort, page } = getPagination(req);
    const query = { recipientId };
    const [items, total, unreadCount] = await Promise.all([
      notificationRepository.find(query, { skip, limit, sort }),
      notificationRepository.count(query),
      notificationRepository.count({ recipientId, isRead: false }),
    ]);
    return { items, unreadCount, meta: buildMeta(total, page, limit) };
  },

  async markRead(id: string) {
    return notificationRepository.updateById(id, { isRead: true });
  },

  async markAllRead(recipientId: string) {
    return notificationRepository.markAllRead(recipientId);
  },
};
