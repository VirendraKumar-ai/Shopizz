import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters')
    .max(100, 'Name is too long'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email'),

  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(128, 'Password is too long')
})

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email'),

  password: z
    .string()
    .min(1, 'Password is required')
})

export const sendOtpSchema = registerSchema

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email'),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be 6 digits')
})

export const resendOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email')
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ResendOtpInput = z.infer<typeof resendOtpSchema>