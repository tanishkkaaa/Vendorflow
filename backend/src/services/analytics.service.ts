import { PurchaseOrder } from '@models/PurchaseOrder.model';
import { Vendor } from '@models/Vendor.model';
import { PurchaseRequest } from '@models/PurchaseRequest.model';
import { Contract } from '@models/Contract.model';
import { ApprovalWorkflow } from '@models/ApprovalWorkflow.model';
import { Types } from 'mongoose';

/**
 * Aggregation-pipeline-driven analytics for the dashboard module:
 * monthly spending, vendor ranking, department spending, purchase trends,
 * average approval time, top vendors, contracts expiring soon.
 */
export const analyticsService = {
  async monthlySpending(organizationId: string, months = 12) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    return PurchaseOrder.aggregate([
      { $match: { organizationId: new Types.ObjectId(organizationId), createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          totalSpend: { $sum: '$grandTotal' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  },

  async departmentSpending(organizationId: string) {
    return PurchaseRequest.aggregate([
      { $match: { organizationId: new Types.ObjectId(organizationId), status: 'po_generated' } },
      { $group: { _id: '$department', totalSpend: { $sum: '$amount' }, requestCount: { $sum: 1 } } },
      { $sort: { totalSpend: -1 } },
    ]);
  },

  async topVendorsByRating(organizationId: string, limit = 10) {
    return Vendor.find({ organizationId, ratingCount: { $gt: 0 } })
      .sort({ score: -1 })
      .limit(limit)
      .select('companyName score ratingAverage ratingCount');
  },

  async vendorSpendRanking(organizationId: string, limit = 10) {
    return PurchaseOrder.aggregate([
      { $match: { organizationId: new Types.ObjectId(organizationId) } },
      { $group: { _id: '$vendorId', totalSpend: { $sum: '$grandTotal' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpend: -1 } },
      { $limit: limit },
      { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
      { $unwind: '$vendor' },
      { $project: { vendorName: '$vendor.companyName', totalSpend: 1, orderCount: 1 } },
    ]);
  },

  async averageApprovalTimeHours(organizationId: string) {
    const result = await ApprovalWorkflow.aggregate([
      { $match: { organizationId: new Types.ObjectId(organizationId), finalStatus: { $ne: 'pending' } } },
      {
        $project: {
          durationHours: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60] },
        },
      },
      { $group: { _id: null, avgHours: { $avg: '$durationHours' } } },
    ]);
    return result[0]?.avgHours ?? 0;
  },

  async contractsExpiringSoon(organizationId: string, days = 30) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    return Contract.find({
      organizationId,
      endDate: { $gte: now, $lte: future },
      status: { $in: ['active', 'expiring_soon'] },
    })
      .populate('vendorId', 'companyName')
      .sort({ endDate: 1 });
  },

  async purchaseTrends(organizationId: string, months = 6) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    return PurchaseRequest.aggregate([
      { $match: { organizationId: new Types.ObjectId(organizationId), createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, status: '$status' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  },

  async summary(organizationId: string) {
    const [monthlySpend, topVendors, expiringContracts, avgApprovalTime] = await Promise.all([
      analyticsService.monthlySpending(organizationId, 1),
      analyticsService.topVendorsByRating(organizationId, 5),
      analyticsService.contractsExpiringSoon(organizationId, 30),
      analyticsService.averageApprovalTimeHours(organizationId),
    ]);
    return {
      currentMonthSpend: monthlySpend[0]?.totalSpend ?? 0,
      topVendors,
      expiringContractsCount: expiringContracts.length,
      averageApprovalTimeHours: Math.round(avgApprovalTime * 10) / 10,
    };
  },
};
