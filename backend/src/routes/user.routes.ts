import { Router } from 'express';
import { userController } from '@controllers/user.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.get('/me', userController.getProfile);
router.get('/', authorize(Role.ADMIN), userController.listOrgUsers);
router.post('/invite', authorize(Role.ADMIN), userController.inviteUser);
router.patch('/:id/deactivate', authorize(Role.ADMIN), userController.deactivate);
router.patch('/:id/activate', authorize(Role.ADMIN), userController.activate);

export default router;
