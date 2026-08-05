import IORedis, { Redis } from 'ioredis';
import { env } from './env';
import { logger } from './logger';

// Shared Redis connection factory for BullMQ (requires maxRetriesPerRequest: null)
export function createRedisConnection(): Redis {
  const connection = new IORedis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    maxRetriesPerRequest: null,
  });

  connection.on('connect', () => logger.info('Redis connected'));
  connection.on('error', (err) => logger.error(`Redis error: ${err.message}`));

  return connection;
}

export const redisConnection = createRedisConnection();
