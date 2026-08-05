import { z } from 'zod';

export const updateVendorProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).optional(),
    contactPerson: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    address: z.string().optional(),
    category: z.string().optional(),
    bankDetails: z
      .object({
        accountHolder: z.string().optional(),
        accountNumber: z.string().optional(),
        ifsc: z.string().optional(),
        bankName: z.string().optional(),
      })
      .optional(),
  }),
});

export const updateVendorStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'verified', 'rejected']),
    rejectionReason: z.string().optional(),
  }),
});
