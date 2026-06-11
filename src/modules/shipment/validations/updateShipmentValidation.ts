import { z } from "zod";

export const updateShipmentValidation = z.object({
  itemName: z.string().min(2).optional(),
  quantity: z.number().min(1).optional(),
  packageWeight: z.number().positive().optional(),
  description: z.string().optional(),
  senderName: z.string().min(2).optional(),
  senderPhone: z.string().min(10).optional(),
  pickupAddress: z.string().min(5).optional(),
  pickupCity: z.string().min(2).optional(),
  pickupPincode: z.string().min(4).optional(),
  receiverName: z.string().min(2).optional(),
  receiverPhone: z.string().min(10).optional(),
  deliveryAddress: z.string().min(5).optional(),
  deliveryCity: z.string().min(2).optional(),
  deliveryPincode: z.string().min(4).optional(),
  shipmentPriority: z.enum(["STANDARD", "EXPRESS", "SAME_DAY"]).optional(),
  isFragile: z.boolean().optional(),
  preferredDeliveryFrom: z.string().nullable().optional(),
  preferredDeliveryTo: z.string().nullable().optional(),
});
