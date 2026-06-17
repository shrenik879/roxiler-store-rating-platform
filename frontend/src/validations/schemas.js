import { z } from 'zod';
import { ROLES } from '@/constants';

const name = z
  .string()
  .min(20, 'Name must be at least 20 characters')
  .max(60, 'Name must be at most 60 characters');

const email = z.string().email('Enter a valid email').max(255);

const address = z.string().max(400, 'Address must be at most 400 characters').optional().or(z.literal(''));

const password = z
  .string()
  .min(8, 'Password must be 8-16 characters')
  .max(16, 'Password must be 8-16 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must include a special character');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name,
  email,
  address,
  password,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const createUserSchema = z.object({
  name,
  email,
  address,
  password,
  role: z.enum([ROLES.ADMIN, ROLES.USER, ROLES.STORE_OWNER]),
});

export const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(60),
  email,
  address,
  ownerId: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
});
