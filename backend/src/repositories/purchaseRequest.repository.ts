import { BaseRepository } from './base.repository';
import { PurchaseRequest, IPurchaseRequest } from '@models/PurchaseRequest.model';

class PurchaseRequestRepository extends BaseRepository<IPurchaseRequest> {
  constructor() {
    super(PurchaseRequest);
  }
}

export const purchaseRequestRepository = new PurchaseRequestRepository();
