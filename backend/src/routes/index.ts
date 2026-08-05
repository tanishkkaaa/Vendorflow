import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vendorRoutes from './vendor.routes';
import rfqRoutes from './rfq.routes';
import quotationRoutes from './quotation.routes';
import approvalRoutes from './approval.routes';
import contractRoutes from './contract.routes';
import purchaseOrderRoutes from './purchaseOrder.routes';
import vendorRatingRoutes from './vendorRating.routes';
import notificationRoutes from './notification.routes';
import auditLogRoutes from './auditLog.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/rfqs', rfqRoutes);
router.use('/quotations', quotationRoutes);
router.use('/approvals', approvalRoutes);
router.use('/contracts', contractRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/vendor-ratings', vendorRatingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
