import { BaseRepository } from './base.repository';
import { Quotation, IQuotation } from '@models/Quotation.model';

class QuotationRepository extends BaseRepository<IQuotation> {
  constructor() {
    super(Quotation);
  }

  findByRFQ(rfqId: string) {
    return this.model.find({ rfqId }).populate('vendorId', 'companyName ratingAverage score').exec();
  }
}

export const quotationRepository = new QuotationRepository();
