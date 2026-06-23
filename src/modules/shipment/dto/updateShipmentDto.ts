export interface UpdateShipmentDto {
  itemName?: string;
  quantity?: number;
  packageWeight?: number;
  description?: string;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  pickupAddress?: string;
  pickupCity?: string;
  pickupPincode?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  shipmentPriority?: "STANDARD" | "EXPRESS" | "SAME_DAY";
  isFragile?: boolean;
  preferredDeliveryFrom?: Date;
  preferredDeliveryTo?: Date;
}
