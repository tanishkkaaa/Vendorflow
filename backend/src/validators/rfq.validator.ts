import { z } from 'zod';

export const createRfqSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    department: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string().min(1),
          quantity: z.number().positive(),
          specifications: z.string().optional(),
        })
      )
      .min(1),
    budget: z.number().positive().optional(),
    deliveryDate: z.coerce.date().optional(),
    specifications: z.string().optional(),
    submissionDeadline: z.coerce.date().optional(),
  }),
});

export const publishRfqSchema = z.object({
  body: z.object({
    vendorIds: z.array(z.string()).min(1),
  }),
});
