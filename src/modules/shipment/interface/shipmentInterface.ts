export interface IShipment {
  trackingId: string;

  itemName: string;
  quantity: number;
  packageWeight: number;

  pickupAddress: string;
  deliveryAddress: string;

  senderName: string;
  senderPhone: string;

  receiverName: string;
  receiverPhone: string;

  deliveryDate: Date;
  deliverySlotId: string;

  amount: number;

  shipmentType: "STANDARD" | "EXPRESS" | "SAME_DAY";

  paymentStatus: "PENDING" | "PAID" | "FAILED";

  status:
    | "PENDING"
    | "CONFIRMED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";
}
