import { z } from "zod";

export const updateShipmentStatusValidation = z.object({
  status: z
    .enum([
      "OUT_FOR_PICKUP",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "COMPLETED",
    ])
    .refine((val) => val !== undefined, {
      message:
        "Invalid status. Allowed values: OUT_FOR_PICKUP, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, COMPLETED",
    }),
  remarks: z.string().min(1).max(500).optional(),
});
