import { cloudinary } from '@config/cloudinary';
import { Readable } from 'stream';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadService = {
  uploadBuffer(buffer: Buffer, folder: string, resourceType: 'auto' | 'raw' | 'image' = 'auto'): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `vendorflow/${folder}`, resource_type: resourceType },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      Readable.from(buffer).pipe(stream);
    });
  },

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  },
};
