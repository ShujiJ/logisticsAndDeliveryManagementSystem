import { z } from "zod";

export const createDeliveryAgentValidation =
  z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phoneNumber: z.string().min(10),
    vehicleType: z.string().optional(),
    vehicleNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    serviceZone: z.string().optional(),
  });