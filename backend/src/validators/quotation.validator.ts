import { z } from 'zod';

export const submitQuotationSchema = z.object({
  body: z.object({
    rfqId: z.string().min(1),
    price: z.coerce.number().positive(),
    deliveryTimelineDays: z.coerce.number().positive(),
    warrantyMonths: z.coerce.number().nonnegative().optional(),
  }),
});
