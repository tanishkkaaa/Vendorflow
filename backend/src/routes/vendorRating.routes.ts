import { Router } from 'express';
import { vendorRatingController } from '@controllers/vendorRating.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.post('/', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN, Role.FINANCE), vendorRatingController.rate);
router.get('/vendor/:vendorId', vendorRatingController.listForVendor);

export default router;
