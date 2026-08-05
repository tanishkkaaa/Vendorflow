import { contractRepository } from '@repositories/contract.repository';
import { ApiError } from '@utils/ApiError';
import { uploadService } from './upload.service';
import { enqueueContractSummary } from '@jobs/queues/aiExtraction.queue';
import { ContractStatus } from '@constants/enums';
import { getPagination, buildMeta } from '@utils/pagination.util';
import { Request } from 'express';

export const contractService = {
  async create(
    organizationId: string,
    createdBy: string,
    input: {
      vendorId: string;
      title: string;
      contractValue?: number;
      startDate: Date;
      endDate: Date;
      reminderDaysBefore?: number;
      file: { buffer: Buffer };
    }
  ) {
    const uploaded = await uploadService.uploadBuffer(input.file.buffer, `contracts/${input.vendorId}`, 'raw');

    const contract = await contractRepository.create({
      organizationId,
      vendorId: input.vendorId,
      title: input.title,
      contractValue: input.contractValue,
      startDate: input.startDate,
      endDate: input.endDate,
      reminderDaysBefore: input.reminderDaysBefore ?? 30,
      createdBy,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          fileUrl: uploaded.url,
          publicId: uploaded.publicId,
          uploadedBy: createdBy,
          uploadedAt: new Date(),
        },
      ],
    } as any);

    await enqueueContractSummary({ contractId: String(contract._id), versionNumber: 1 });

    return contract;
  },

  async getById(id: string, organizationId: string) {
    const contract = await contractRepository.findById(id, 'vendorId createdBy');
    if (!contract || String(contract.organizationId) !== organizationId) throw ApiError.notFound('Contract not found');
    return contract;
  },

  async list(req: Request, organizationId: string, filters: Record<string, unknown> = {}) {
    const { skip, limit, sort, page } = getPagination(req);
    const query = { organizationId, ...filters };
    const [items, total] = await Promise.all([
      contractRepository.find(query, { skip, limit, sort, populate: 'vendorId' }),
      contractRepository.count(query),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  /** Uploads a new version of the contract (renewal / amendment), preserving full version history. */
  async uploadNewVersion(
    id: string,
    organizationId: string,
    uploadedBy: string,
    input: { file: { buffer: Buffer }; changeNote?: string; newEndDate?: Date }
  ) {
    const contract = await contractService.getById(id, organizationId);
    const uploaded = await uploadService.uploadBuffer(input.file.buffer, `contracts/${contract.vendorId}`, 'raw');

    const nextVersion = contract.currentVersion + 1;
    contract.versions.push({
      version: nextVersion,
      fileUrl: uploaded.url,
      publicId: uploaded.publicId,
      uploadedBy: uploadedBy as any,
      uploadedAt: new Date(),
      changeNote: input.changeNote,
    });
    contract.currentVersion = nextVersion;
    if (input.newEndDate) {
      contract.endDate = input.newEndDate;
      contract.status = ContractStatus.RENEWED;
    }
    await contract.save();

    await enqueueContractSummary({ contractId: String(contract._id), versionNumber: nextVersion });

    return contract;
  },
};
