// export interface CreateShipmentDto {
//   itemName: string;
//   quantity: number;
//   packageWeight: number;
//   pickupAddress: string;
//   deliveryAddress: string;
//   senderName: string;
//   senderPhone: string;
//   receiverName: string;
//   receiverPhone: string;
//   deliveryDate: Date;
//   deliverySlotId: string;
//   amount: number;
//   shipmentType: "STANDARD" | "EXPRESS" | "SAME_DAY";
// }
export interface CreateShipmentDto {
  itemName: string;
  quantity: number;
  packageWeight: number;
  description?: string;
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPincode: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  shipmentPriority?: "STANDARD" | "EXPRESS" | "SAME_DAY";
  isFragile?: boolean;
  preferredDeliveryFrom?: Date;
  preferredDeliveryTo?: Date;
}
