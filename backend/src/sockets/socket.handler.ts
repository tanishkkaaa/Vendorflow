import { Server, Socket } from 'socket.io';
import http from 'http';
import { verifyAccessToken } from '@utils/jwt.util';
import { env } from '@config/env';
import { logger } from '@config/logger';

let io: Server;

/** Room naming convention: user:<userId> and org:<organizationId> */
export function initSocket(server: http.Server): Server {
  io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Authentication token missing'));
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.organizationId = payload.organizationId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId, organizationId } = socket.data;
    socket.join(`user:${userId}`);
    socket.join(`org:${organizationId}`);
    logger.info(`Socket connected: user=${userId} org=${organizationId}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user=${userId}`);
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  getIo().to(`user:${userId}`).emit(event, payload);
}

export function emitToOrganization(organizationId: string, event: string, payload: unknown) {
  getIo().to(`org:${organizationId}`).emit(event, payload);
}
