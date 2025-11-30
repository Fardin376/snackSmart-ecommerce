import { z } from 'zod';

export const fullNameSchema = z
  .string()
  .min(3, 'Full name must be at least 3 characters')
  .max(100, 'Full name must be at most 100 characters');

export const emailSchema = z.string().email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Must include at least one special character'
  )
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[a-z]/, 'Must include a lowercase letter')
  .regex(/[0-9]/, 'Must include a number');

export const registerSchema = z.object({
  firstName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  price: z.number().positive(),
  image: z.string().url().optional(),
});
