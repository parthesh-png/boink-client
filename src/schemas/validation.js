import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters' }),
  bio: z
    .string()
    .max(500, { message: 'Bio cannot exceed 500 characters' })
    .optional()
    .default(''),
  profilePicture: z
    .string()
    .trim()
    .optional()
    .default(''),
});

export const createPostSchema = z.object({
  text: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(''),
}).refine((data) => data.text.length > 0 || data.image.length > 0, {
  message: 'Post must contain either text or an image',
  path: ['text'],
});
