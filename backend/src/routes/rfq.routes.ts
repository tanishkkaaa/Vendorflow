import { Router } from 'express';
import { rfqController } from '@controllers/rfq.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { validate } from '@middlewares/validate.middleware';
import { createRfqSchema, publishRfqSchema } from '@validators/rfq.validator';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.post('/', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN), validate(createRfqSchema), rfqController.create);
router.get('/', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN, Role.FINANCE), rfqController.list);
router.get('/invited', authorize(Role.VENDOR), rfqController.listForVendor);
router.get('/:id', rfqController.getById);
router.post('/:id/publish', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN), validate(publishRfqSchema), rfqController.publish);
router.post('/:id/close', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN), rfqController.close);

export default router;
