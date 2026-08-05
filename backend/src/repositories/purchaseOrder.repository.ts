import { BaseRepository } from './base.repository';
import { PurchaseOrder, IPurchaseOrder } from '@models/PurchaseOrder.model';

class PurchaseOrderRepository extends BaseRepository<IPurchaseOrder> {
  constructor() {
    super(PurchaseOrder);
  }
}

export const purchaseOrderRepository = new PurchaseOrderRepository();
