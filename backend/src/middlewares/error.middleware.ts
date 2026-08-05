import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError';
import { ApiResponse } from '@utils/ApiResponse';
import { logger } from '@config/logger';
import { env } from '@config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err.name === 'ValidationError') {
    apiError = ApiError.badRequest('Validation failed', err.message);
  } else if (err.name === 'CastError') {
    apiError = ApiError.badRequest('Invalid identifier supplied');
  } else if ((err as any).code === 11000) {
    apiError = ApiError.conflict('Duplicate value violates a unique constraint');
  } else {
    apiError = ApiError.internal(env.isProd ? 'Something went wrong' : err.message);
  }

  if (!apiError.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack ?? err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${apiError.message}`);
  }

  res
    .status(apiError.statusCode)
    .json(new ApiResponse(apiError.message, undefined, { details: apiError.details }, false));
}
