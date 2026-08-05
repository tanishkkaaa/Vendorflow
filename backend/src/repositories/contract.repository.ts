import { BaseRepository } from './base.repository';
import { Contract, IContract } from '@models/Contract.model';

class ContractRepository extends BaseRepository<IContract> {
  constructor() {
    super(Contract);
  }

  findExpiringWithinDays(days: number) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    return this.model
      .find({ endDate: { $gte: now, $lte: future }, status: { $in: ['active', 'expiring_soon'] } })
      .populate('vendorId', 'companyName email')
      .exec();
  }
}

export const contractRepository = new ContractRepository();
