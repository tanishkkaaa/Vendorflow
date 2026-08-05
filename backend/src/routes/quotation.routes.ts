import { Router } from 'express';
import { quotationController } from '@controllers/quotation.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authorize } from '@middlewares/rbac.middleware';
import { upload } from '@middlewares/upload.middleware';
import { validate } from '@middlewares/validate.middleware';
import { submitQuotationSchema } from '@validators/quotation.validator';
import { Role } from '@constants/roles';

const router = Router();
router.use(authenticate);

router.post('/', authorize(Role.VENDOR), upload.single('file'), validate(submitQuotationSchema), quotationController.submit);
router.get('/rfq/:rfqId', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN, Role.FINANCE), quotationController.listForRFQ);
router.get('/rfq/:rfqId/compare', authorize(Role.PROCUREMENT_MANAGER, Role.ADMIN), quotationController.compare);
router.get('/:id', quotationController.getById);

export default router;
