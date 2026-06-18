import Payment from "../models/paymentModel";
import Shipment from "../../shipment/models/shipmentModel";

class PaymentRepository {
  // Create the initial payment record when customer initiates payment
  createPayment = async (data: {
    shipmentId: number;
    customerId: number;
    amount: number;
  }) => {
    return await Payment.create({
      ...data,
      paymentStatus: "PENDING",
    });
  };

  // Called after Razorpay order is created on backend
  createPaymentWithRazorpayOrder = async (data: {
    shipmentId: number;
    customerId: number;
    amount: number;
    razorpayOrderId: string;
  }) => {
    return await Payment.create({
      ...data,
      paymentStatus: "PENDING",
      razorpayOrderId: data.razorpayOrderId,
    });
  };

  // Find payment by shipment id
  findPaymentByShipmentId = async (shipmentId: number) => {
    return await Payment.findOne({ where: { shipmentId } });
  };

  //  Find payment by Razorpay order ID Used when processing webhook to link order to payment record
  findPaymentByRazorpayOrderId = async (razorpayOrderId: string) => {
    return await Payment.findOne({ where: { razorpayOrderId } });
  };

  // Find payment by Razorpay payment ID Used to verify if payment already exists in database
  findPaymentByRazorpayPaymentId = async (razorpayPaymentId: string) => {
    return await Payment.findOne({ where: { razorpayPaymentId } });
  };

  // Mark payment as PAID and record the timestamp
  markAsPaid = async (paymentId: number, transactionId: string) => {
    return await Payment.update(
      {
        paymentStatus: "PAID",
        transactionId,
        paidAt: new Date(),
      },
      { where: { id: paymentId } },
    );
  };

  // Called from webhook when payment.authorized event is received
  markAsPaidWithRazorpay = async (
    paymentId: number,
    razorpayPaymentId: string,
    transactionId: string,
    priceBreakdown: object, // price breakdown
  ) => {
    return await Payment.update(
      {
        paymentStatus: "PAID",
        transactionId,
        razorpayPaymentId,
        paidAt: new Date(),
        priceBreakdown, // price breakdown
      },
      { where: { id: paymentId } },
    );
  };

  // Mark payment as FAILED
  markAsFailed = async (paymentId: number) => {
    return await Payment.update(
      { paymentStatus: "FAILED" },
      { where: { id: paymentId } },
    );
  };

  //  Delete payment record (used when customer restarts payment)
deletePayment = async (paymentId: number) => {
return await Payment.destroy({
where: { id: paymentId },
});
};

  getMyPaymentsRepository = async (customerId: number, limit: number, offset: number) => {
    return await Payment.findAndCountAll({
      where: { customerId },
      attributes: ["id", "shipmentId", "amount", "paymentStatus", "transactionId", "paidAt"],
      include: [{ model: Shipment, as: "shipment", attributes: ["trackingId"] }],
      order: [["paidAt", "DESC"]],
      limit,
      offset,
    });
  };

  // Update payment with Razorpay payment ID Called after frontend verifies signature and sends payment ID
  updateWithRazorpayPaymentId = async (
    paymentId: number,
    razorpayPaymentId: string,
  ) => {
    return await Payment.update(
      { razorpayPaymentId },
      { where: { id: paymentId } },
    );
  };
}

export default new PaymentRepository();