import multer from 'multer';
import { ApiError } from '@utils/ApiError';

const storage = multer.memoryStorage();

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
]);

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`) as unknown as null, false);
      return;
    }
    cb(null, true);
  },
});
