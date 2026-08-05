import { Router } from 'express';
import { approvalController } from '@controllers/approval.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.post('/', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN), approvalController.createRequest);
router.get('/queue', authorize(Role.PROCUREMENT_MANAGER, Role.FINANCE, Role.DIRECTOR), approvalController.myQueue);
router.get('/:id', approvalController.getWorkflow);
router.post('/:id/act', authorize(Role.PROCUREMENT_MANAGER, Role.FINANCE, Role.DIRECTOR), approvalController.act);

export default router;
