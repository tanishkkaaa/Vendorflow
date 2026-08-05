import { BaseRepository } from './base.repository';
import { Vendor, IVendor } from '@models/Vendor.model';

class VendorRepository extends BaseRepository<IVendor> {
  constructor() {
    super(Vendor);
  }

  findByOrganization(organizationId: string, filter: Record<string, unknown> = {}, options?: any) {
    return this.find({ organizationId, ...filter }, options);
  }

  findPotentialDuplicates(organizationId: string, gstNumber?: string, companyName?: string, excludeId?: string) {
    const or: Record<string, unknown>[] = [];
    if (gstNumber) or.push({ gstNumber });
    if (companyName) or.push({ companyName: { $regex: `^${companyName}$`, $options: 'i' } });
    if (or.length === 0) return Promise.resolve([]);
    return this.model
      .find({ organizationId, ...(excludeId ? { _id: { $ne: excludeId } } : {}), $or: or })
      .exec();
  }
}

export const vendorRepository = new VendorRepository();
