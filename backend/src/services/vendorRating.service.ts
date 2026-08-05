import { vendorRatingRepository } from '@repositories/vendorRating.repository';
import { vendorRepository } from '@repositories/vendor.repository';
import { purchaseOrderRepository } from '@repositories/purchaseOrder.repository';
import { ApiError } from '@utils/ApiError';

export const vendorRatingService = {
  /**
   * Records a rating tied to a completed purchase order, then recomputes the
   * vendor's rolling average and an overall performance score (0-100) used
   * for ranking/recommendation across the platform.
   */
  async rate(
    organizationId: string,
    ratedBy: string,
    input: { purchaseOrderId: string; delivery: number; quality: number; support: number; cost: number; comment?: string }
  ) {
    const po = await purchaseOrderRepository.findById(input.purchaseOrderId);
    if (!po || String(po.organizationId) !== organizationId) throw ApiError.notFound('Purchase order not found');

    const existing = await vendorRatingRepository.findOne({ purchaseOrderId: input.purchaseOrderId });
    if (existing) throw ApiError.conflict('This purchase order has already been rated');

    const rating = await vendorRatingRepository.create({
      organizationId,
      vendorId: po.vendorId,
      purchaseOrderId: po._id,
      ratedBy,
      delivery: input.delivery,
      quality: input.quality,
      support: input.support,
      cost: input.cost,
      comment: input.comment,
    } as any);

    await vendorRatingService.recomputeVendorScore(String(po.vendorId));

    return rating;
  },

  async recomputeVendorScore(vendorId: string) {
    const ratings = await vendorRatingRepository.findByVendor(vendorId);
    if (ratings.length === 0) return;

    const avg = ratings.reduce((sum, r) => sum + r.overall, 0) / ratings.length;
    const score = Math.round((avg / 5) * 100);

    await vendorRepository.updateById(vendorId, {
      ratingAverage: Number(avg.toFixed(2)),
      ratingCount: ratings.length,
      score,
    });
  },

  async listForVendor(vendorId: string) {
    return vendorRatingRepository.findByVendor(vendorId);
  },
};
