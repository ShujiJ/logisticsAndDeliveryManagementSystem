import razorpayUtil from "../../../shared/utils/razorpayUtil";
import paymentRepository from "../repositories/paymentRepository";
import shipmentRepository from "../../shipment/repositories/shipmentRepository";
import Notification from "../../notifications/models/notificationModel";
import { NOTIFICATION_TYPE } from "../../notifications/constants/notificationConstants";

class RefundService {
  refundPaymentService = async (shipmentId: number) => {
    const payment = await paymentRepository.findPaymentByShipmentId(shipmentId);

    // No payment record means customer never initiated payment — nothing to refund
    if (!payment) return;

    // Only process refund if customer actually paid
    if (payment.paymentStatus !== "PAID") return;

    const shipment = await shipmentRepository.findShipmentById(shipmentId);

    // Razorpay refund — money is returned to customer's original payment method
    if (payment.razorpayPaymentId) {
      const refund = await razorpayUtil.refundPayment(
        payment.razorpayPaymentId,
        Number(payment.amount),
      );
      await paymentRepository.markAsRefunded(
        payment.id,
        refund.id,
        new Date((refund.created_at as number) * 1000),
      );
    } else {
      await paymentRepository.markAsRefunded(payment.id, "", new Date());
    }

    await Notification.create({
      userId: payment.customerId,
      shipmentId,
      title: "Refund Initiated",
      message: `Your refund of ₹${payment.amount} for shipment ${shipment?.trackingId} has been initiated`,
      type: NOTIFICATION_TYPE.PAYMENT_REFUNDED,
    });
  };
}

export default new RefundService();
