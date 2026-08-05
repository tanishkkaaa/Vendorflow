import { Router } from 'express';
import { auditLogController } from '@controllers/auditLog.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.get('/', authorize(Role.ADMIN), auditLogController.list);

export default router;
