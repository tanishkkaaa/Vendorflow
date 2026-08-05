import { vendorRepository } from '@repositories/vendor.repository';
import { ApiError } from '@utils/ApiError';
import { VendorStatus } from '@constants/enums';
import { uploadService } from './upload.service';
import { aiService } from './ai.service';
import { getPagination, buildMeta } from '@utils/pagination.util';
import { Request } from 'express';

export const vendorService = {
  async listVendors(req: Request, organizationId: string, filters: Record<string, unknown> = {}) {
    const { skip, limit, sort, page } = getPagination(req);
    const query = { organizationId, ...filters };
    const [items, total] = await Promise.all([
      vendorRepository.find(query, { skip, limit, sort }),
      vendorRepository.count(query),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  async getVendor(vendorId: string, organizationId: string) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor || String(vendor.organizationId) !== organizationId) {
      throw ApiError.notFound('Vendor not found');
    }
    return vendor;
  },

  async updateProfile(vendorId: string, organizationId: string, updates: Record<string, unknown>) {
    const vendor = await vendorService.getVendor(vendorId, organizationId);
    Object.assign(vendor, updates);
    // Any profile edit after verification resets status for re-review
    if (vendor.status === VendorStatus.VERIFIED) vendor.status = VendorStatus.PENDING;
    await vendor.save();
    return vendor;
  },

  async uploadDocument(
    vendorId: string,
    organizationId: string,
    file: { buffer: Buffer; mimetype: string },
    type: 'gst' | 'pan' | 'certificate' | 'bank_proof' | 'other',
    label: string
  ) {
    const vendor = await vendorService.getVendor(vendorId, organizationId);
    const uploaded = await uploadService.uploadBuffer(file.buffer, `vendors/${vendorId}/documents`, 'auto');

    vendor.documents.push({
      type,
      label,
      fileUrl: uploaded.url,
      publicId: uploaded.publicId,
      uploadedAt: new Date(),
    });
    await vendor.save();
    return vendor;
  },

  /**
   * Runs both a deterministic check (exact GST / exact company name match)
   * and an AI semantic check (name variations, abbreviations, typos) to flag
   * likely duplicate vendor registrations before/during verification.
   */
  async checkForDuplicates(vendorId: string, organizationId: string) {
    const vendor = await vendorService.getVendor(vendorId, organizationId);

    const exactMatches = await vendorRepository.findPotentialDuplicates(
      organizationId,
      vendor.gstNumber,
      vendor.companyName,
      String(vendor._id)
    );

    if (exactMatches.length > 0) {
      vendor.isDuplicateFlagged = true;
      vendor.duplicateOfVendorId = exactMatches[0]._id as any;
      await vendor.save();
      return { isDuplicate: true, matchedVendorId: String(exactMatches[0]._id), reason: 'Exact GST/company name match' };
    }

    // Broaden candidate pool for semantic comparison (cap to a reasonable batch)
    const candidatePool = await vendorRepository.findByOrganization(organizationId, {
      _id: { $ne: vendor._id },
    }, { limit: 25 });

    if (candidatePool.length === 0) {
      return { isDuplicate: false, matchedVendorId: null, reason: 'No existing vendors to compare against.' };
    }

    const aiResult = await aiService.detectSemanticDuplicate(
      { companyName: vendor.companyName, email: vendor.email, gstNumber: vendor.gstNumber },
      candidatePool.map((v) => ({ id: String(v._id), companyName: v.companyName, email: v.email, gstNumber: v.gstNumber }))
    );

    if (aiResult.isDuplicate && aiResult.matchedVendorId) {
      vendor.isDuplicateFlagged = true;
      vendor.duplicateOfVendorId = aiResult.matchedVendorId as any;
      await vendor.save();
    }

    return aiResult;
  },

  async updateStatus(vendorId: string, organizationId: string, status: VendorStatus, rejectionReason?: string) {
    const vendor = await vendorService.getVendor(vendorId, organizationId);
    vendor.status = status;
    if (status === VendorStatus.REJECTED) vendor.rejectionReason = rejectionReason;
    await vendor.save();
    return vendor;
  },
};
