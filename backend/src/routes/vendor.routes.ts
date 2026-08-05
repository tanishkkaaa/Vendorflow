import { Router } from 'express';
import { vendorController } from '@controllers/vendor.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { upload } from '@middlewares/upload.middleware';
import { validate } from '@middlewares/validate.middleware';
import { updateVendorProfileSchema, updateVendorStatusSchema } from '@validators/vendor.validator';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.get('/', authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER, Role.FINANCE), vendorController.list);
router.get('/me', authorize(Role.VENDOR), vendorController.getMyProfile);
router.get('/:id', vendorController.getById);
router.patch('/:id', validate(updateVendorProfileSchema), vendorController.updateProfile);
router.post('/:id/documents', upload.single('file'), vendorController.uploadDocument);
router.post('/:id/check-duplicates', authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER), vendorController.checkDuplicates);
router.patch(
  '/:id/status',
  authorize(Role.ADMIN, Role.PROCUREMENT_MANAGER),
  validate(updateVendorStatusSchema),
  vendorController.updateStatus
);

export default router;
