import { BaseRepository } from './base.repository';
import { RFQ, IRFQ } from '@models/RFQ.model';

class RFQRepository extends BaseRepository<IRFQ> {
  constructor() {
    super(RFQ);
  }
}

export const rfqRepository = new RFQRepository();
