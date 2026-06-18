import { z } from "zod";

export const verifyOtpValidation = z.object({
  otp: z
    .string()
    .length(4, "OTP must be exactly 4 digits")
    .regex(/^\d{4}$/, "OTP must contain only digits"),
});
