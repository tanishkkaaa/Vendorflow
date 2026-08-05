import { Router } from 'express';
import { contractController } from '@controllers/contract.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { upload } from '@middlewares/upload.middleware';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.post('/', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN), upload.single('file'), contractController.create);
router.get('/', contractController.list);
router.get('/:id', contractController.getById);
router.post(
  '/:id/versions',
  authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN),
  upload.single('file'),
  contractController.uploadNewVersion
);

export default router;
