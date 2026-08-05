import { Router } from 'express';
import { analyticsController } from '@controllers/analytics.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate, authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE, Role.DIRECTOR));

router.get('/summary', analyticsController.summary);
router.get('/monthly-spending', analyticsController.monthlySpending);
router.get('/department-spending', analyticsController.departmentSpending);
router.get('/top-vendors', analyticsController.topVendors);
router.get('/vendor-spend-ranking', analyticsController.vendorSpendRanking);
router.get('/purchase-trends', analyticsController.purchaseTrends);
router.get('/expiring-contracts', analyticsController.expiringContracts);

export default router;
