import { z } from "zod";

export const createShipmentValidation = z.object({
  itemName: z.string().min(2),
  quantity: z.number().min(1),
  packageWeight: z.number().min(1),
  description: z.string().optional(),
  senderName: z.string().min(2),
  senderPhone: z.string().min(10),
  pickupAddress: z.string().min(5),
  pickupCity: z.string().min(2),
  pickupPincode: z.string().min(4),
  receiverName: z.string().min(2),
  receiverPhone: z.string().min(10),
  deliveryAddress: z.string().min(5),
  deliveryCity: z.string().min(2),
  deliveryPincode: z.string().min(4),
  shipmentPriority: z.enum(["STANDARD", "EXPRESS", "SAME_DAY"]).optional(),
  isFragile: z.boolean().optional(),
  // preferredDeliveryFrom: z.string().optional().or(z.literal("")),
  // preferredDeliveryTo: z.string().optional().or(z.literal("")),
  //frontend sends as a string
  preferredDeliveryFrom: z.string().nullable().optional(),
  preferredDeliveryTo: z.string().nullable().optional(),
});
