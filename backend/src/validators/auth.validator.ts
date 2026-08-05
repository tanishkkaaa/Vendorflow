import { z } from 'zod';

export const registerOrgSchema = z.object({
  body: z.object({
    orgName: z.string().min(2),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const registerVendorSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    companyName: z.string().min(2),
    contactPerson: z.string().min(2),
    phone: z.string().min(6),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10) }),
});
