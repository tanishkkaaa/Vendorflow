import { BaseRepository } from './base.repository';
import { VendorRating, IVendorRating } from '@models/VendorRating.model';

class VendorRatingRepository extends BaseRepository<IVendorRating> {
  constructor() {
    super(VendorRating);
  }

  findByVendor(vendorId: string) {
    return this.model.find({ vendorId }).sort({ createdAt: -1 }).exec();
  }
}

export const vendorRatingRepository = new VendorRatingRepository();
