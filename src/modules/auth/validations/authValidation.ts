import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(3).optional(),
    phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional(),
  })
  .refine((data) => data.name !== undefined || data.phoneNumber !== undefined, {
    message: "At least one field (name or phoneNumber) is required",
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

