import { Router } from 'express';
import { purchaseOrderController } from '@controllers/purchaseOrder.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.post(
  '/from-request/:purchaseRequestId',
  authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN, Role.FINANCE),
  purchaseOrderController.generate
);
router.get('/', purchaseOrderController.list);
router.get('/:id', purchaseOrderController.getById);

export default router;
