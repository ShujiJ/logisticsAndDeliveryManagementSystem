import ApiError from "../../../shared/utils/apiError";
import razorpayUtil from "../../../shared/utils/razorpayUtil";
import paymentRepository from "../repositories/paymentRepository";
import shipmentRepository from "../../shipment/repositories/shipmentRepository";
import Notification from "../../notifications/models/notificationModel";
import { NOTIFICATION_TYPE } from "../../notifications/constants/notificationConstants";

class RefundService {
  refundPaymentService = async (shipmentId: number) => {
    const payment = await paymentRepository.findPaymentByShipmentId(shipmentId);
    if (!payment) throw new ApiError(404, "Payment record not found");

    // Only process refund if customer actually paid
    if (payment.paymentStatus !== "PAID") return;

    const shipment = await shipmentRepository.findShipmentById(shipmentId);

    // Razorpay refund — money is returned to customer's original payment method
    if (payment.razorpayPaymentId) {
      await razorpayUtil.refundPayment(
        payment.razorpayPaymentId,
        Number(payment.amount),
      );
    }

    await paymentRepository.markAsRefunded(payment.id);

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
