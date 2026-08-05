import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt.util';
import { ApiError } from '@utils/ApiError';
import { asyncHandler } from '@utils/asyncHandler';
import { userRepository } from '@repositories/user.repository';

export interface AuthUser {
  userId: string;
  role: string;
  organizationId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token missing');
  }

  const token = header.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User no longer active');
    }
    req.user = { userId: payload.userId, role: payload.role, organizationId: payload.organizationId };
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized('Invalid or expired token');
  }
});
