import http from 'http';
import { createApp } from './app';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { connectDatabase, disconnectDatabase } from '@config/database';
import { initSocket } from '@sockets/socket.handler';
import { registerAllCronJobs } from '@jobs/cron';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);
  registerAllCronJobs();

  server.listen(env.port, () => {
    logger.info(`VendorFlow AI backend listening on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`API base path: ${env.apiPrefix}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Shutdown complete.');
      process.exit(0);
    });
    // Force exit if graceful shutdown hangs
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.stack ?? err.message}`);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start server: ${err instanceof Error ? err.stack : err}`);
  process.exit(1);
});
