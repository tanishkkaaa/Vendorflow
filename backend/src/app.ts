import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from '@config/env';
import { logger } from '@config/logger';
import apiRoutes from '@routes/index';
import { errorHandler, notFoundHandler } from '@middlewares/error.middleware';
import { globalRateLimiter } from '@middlewares/rateLimiter.middleware';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.http?.(message.trim()) ?? logger.info(message.trim()) },
    })
  );
  app.use(globalRateLimiter);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'vendorflow-ai-backend', timestamp: new Date().toISOString() });
  });

  app.use(env.apiPrefix, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
