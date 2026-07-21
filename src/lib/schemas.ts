import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
  age: z.coerce.number().int('Age must be a whole number').min(4, 'You must be at least 4').max(18, 'You must be 18 or younger'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  code: z.string().length(6, 'Code must be 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const onboardingSchema = z.object({
  ageGroup: z.enum(['A', 'B']),
  avatar: z.string().default('🦊'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
