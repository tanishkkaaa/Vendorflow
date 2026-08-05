import { Router } from 'express';
import { authController } from '@controllers/auth.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { authRateLimiter } from '@middlewares/rateLimiter.middleware';
import { registerOrgSchema, loginSchema, registerVendorSchema, refreshTokenSchema } from '@validators/auth.validator';

const router = Router();

router.post('/register-organization', authRateLimiter, validate(registerOrgSchema), authController.registerOrganization);
router.post('/register-vendor', authRateLimiter, validate(registerVendorSchema), authController.registerVendor);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.get('/me', authenticate, authController.me);

export default router;
