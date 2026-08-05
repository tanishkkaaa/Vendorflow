import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError';
import { Role } from '@constants/roles';

/**
 * Role-based access control middleware.
 * Usage: router.post('/vendors/:id/verify', authenticate, authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER), handler)
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!allowedRoles.includes(req.user.role as Role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}
