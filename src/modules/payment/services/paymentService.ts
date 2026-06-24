import ApiError from "../../../shared/utils/apiError";
import { calculateShippingAmount } from "../../../shared/utils/pricingUtil"; // price breakdown
import shipmentRepository from "../../shipment/repositories/shipmentRepository";
import paymentRepository from "../repositories/paymentRepository";
import autoAssignService from "../../shipment/services/autoAssignService";
import razorpayUtil from "../../../shared/utils/razorpayUtil";
import Notification from "../../notifications/models/notificationModel";
import { NOTIFICATION_TYPE } from "../../notifications/constants/notificationConstants";
import { env } from "../../../config/env";

class PaymentService {
  // Returns order ID to be used by frontend checkout
  initiatePaymentService = async (shipmentId: number, customerId: number) => {
    //  Validate shipment exists
    const shipment = await shipmentRepository.findShipmentById(shipmentId);
    if (!shipment) throw new ApiError(404, "Shipment not found");

    // Validate customer owns shipment
    if (shipment.customerId !== customerId) {
      throw new ApiError(403, "You can only pay for your own shipments");
    }

    // Validate shipment status allows payment
    if (shipment.shipmentStatus !== "PENDING") {
      throw new ApiError(
        400,
        `Payment cannot be made. Shipment is already ${shipment.shipmentStatus}`,
      );
    }

    const existingPayment =
      await paymentRepository.findPaymentByShipmentId(shipmentId);

    if (existingPayment) {
      // Block if already paid
      if (existingPayment.paymentStatus === "PAID") {
        throw new ApiError(400, "Payment is already completed for this shipment");
      }

      // PENDING — reuse existing Razorpay order only if amount hasn't changed
      if (existingPayment.paymentStatus === "PENDING" && existingPayment.razorpayOrderId) {
        if (Number(existingPayment.amount) !== Number(shipment.amount)) {
          // Shipment was edited after order was created — delete stale payment record and fall through to create fresh order
          await paymentRepository.deletePayment(existingPayment.id);
        } else {
          return {
            orderId: existingPayment.razorpayOrderId,
            amount: shipment.amount, // rupees
            currency: "INR",
            keyId: env.RAZORPAY_KEY_ID,
            shipmentId,
            paymentId: existingPayment.id,
          };
        }
      }

      // FAILED — delete and allow a fresh Razorpay order to be created below
      await paymentRepository.deletePayment(existingPayment.id);
    }

    try {
      //  Create Razorpay order using utility
      const razorpayOrder = await razorpayUtil.createOrder(
        shipment.amount,
        shipmentId,
        customerId,
        "", // Email would come from user model in real implementation
        "", // Phone would come from user model in real implementation
      );

      //  Create payment record with Razorpay order ID
      const payment = await paymentRepository.createPaymentWithRazorpayOrder({
        shipmentId,
        customerId,
        amount: shipment.amount,
        razorpayOrderId: razorpayOrder.orderId,
      });

      return {
        orderId: razorpayOrder.orderId,
        amount: Number(razorpayOrder.amount) / 100, // convert paise to rupees
        currency: razorpayOrder.currency,
        keyId: razorpayOrder.keyId,
        shipmentId,
        paymentId: payment.id,
      };
    } catch (error) {
      console.error("Error initiating payment:", error);
      throw new ApiError(500, "Failed to initiate payment");
    }
  };
  // - Verify payment

  verifyPaymentService = async (
    shipmentId: number,
    customerId: number,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) => {
    try {
      const payment =
        await paymentRepository.findPaymentByRazorpayOrderId(razorpayOrderId);
      if (!payment) {
        throw new ApiError(404, "Payment record not found");
      }

      // Ensure the order ID belongs to the shipment in the URL
      if (payment.shipmentId !== shipmentId) {
        throw new ApiError(400, "Order ID does not belong to this shipment");
      }

      // Block re-processing payments that are already settled
      if (payment.paymentStatus === "PAID") {
        throw new ApiError(400, "Payment is already completed for this shipment");
      }
      if (payment.paymentStatus === "REFUNDED") {
        throw new ApiError(400, "Payment has already been refunded");
      }

      // Verify customer is authorized to complete this payment
      if (payment.customerId !== customerId) {
        throw new ApiError(403, "Unauthorized payment verification");
      }

      // Verify payment signature using Razorpay utility
      const isSignatureValid = razorpayUtil.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );

      if (!isSignatureValid) {
        throw new ApiError(400, "Payment signature verification failed");
      }

      //  Fetch payment details from Razorpay to confirm status
      const razorpayPayment =
        await razorpayUtil.fetchPaymentDetails(razorpayPaymentId);

      //  Check if payment is actually authorized by Razorpay
      if (
        razorpayPayment.status !== "captured" &&
        razorpayPayment.status !== "authorized"
      ) {
        throw new ApiError(400, "Payment not captured by Razorpay");
      }

      //  Update payment record with Razorpay payment ID
      await paymentRepository.updateWithRazorpayPaymentId(
        payment.id,
        razorpayPaymentId,
      );

      // price breakdown — compute snapshot before marking PAID
      const shipment = await shipmentRepository.findShipmentById(shipmentId);
      const { breakdown } = calculateShippingAmount(
        shipment!.packageWeight,
        (shipment!.shipmentPriority as "STANDARD" | "EXPRESS" | "SAME_DAY") ?? "STANDARD",
        shipment!.isFragile ?? false,
      );

      // Mark payment as PAID in database
      await paymentRepository.markAsPaidWithRazorpay(
        payment.id,
        razorpayPaymentId,
        razorpayPaymentId,
        breakdown, // price breakdown
      );

      // Update shipment payment status to PAID and status to CONFIRMED
      await shipmentRepository.updatePaymentAndStatus(
        shipmentId,
        "PAID",
        "CONFIRMED",
      );

      // Trigger auto-assignment of delivery agent and slot
      await autoAssignService.autoAssignAgentAndSlot(shipmentId, customerId);

      const updatedPayment =
        await paymentRepository.findPaymentByShipmentId(shipmentId);
      const updatedShipment =
        await shipmentRepository.findShipmentById(shipmentId);

      // NOTIFY CUSTOMER — PAYMENT SUCCESSFUL
      await Notification.create({
        userId: customerId,
        shipmentId,
        title: "Payment Successful",
        message: `Payment for shipment ${updatedShipment?.trackingId} was successful`,
        type: NOTIFICATION_TYPE.PAYMENT_UPDATE,
      });

      return {
        id: updatedPayment?.id,
        shipmentId: updatedPayment?.shipmentId,
        customerId: updatedPayment?.customerId,
        transactionId: updatedPayment?.transactionId,
        amount: updatedPayment?.amount,
        paymentStatus: updatedPayment?.paymentStatus,
        paidAt: updatedPayment?.paidAt,
        razorpayPaymentId: updatedPayment?.razorpayPaymentId,
        shipmentStatus: updatedShipment?.shipmentStatus,
        deliveryAgentId: updatedShipment?.deliveryAgentId,
        deliverySlotId: updatedShipment?.deliverySlotId,
      };
    } catch (error) {
      console.error("Error verifying payment:", error);
      // Mark payment as FAILED if verification failed
      const payment =
        await paymentRepository.findPaymentByRazorpayOrderId(razorpayOrderId);
      if (payment) {
        await paymentRepository.markAsFailed(payment.id);
      }
      throw error;
    }
  };

  // Fetch payment details for a shipment
  getPaymentByShipmentService = async (
    shipmentId: number,
    customerId: number,
    role: string,
  ) => {
    const shipment = await shipmentRepository.findShipmentById(shipmentId);
    if (!shipment) throw new ApiError(404, "Shipment not found");

    if (role !== "admin" && shipment.customerId !== customerId) {
      throw new ApiError(403, "Access denied");
    }

    const payment = await paymentRepository.findPaymentByShipmentId(shipmentId);
    if (!payment) throw new ApiError(404, "No payment found for this shipment");

    return payment;
  };

  // Customer fetches their own payment history with pagination
  getMyPaymentsService = async (customerId: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await paymentRepository.getMyPaymentsRepository(customerId, limit, offset);

    return {
      payments: rows.map((p: any) => ({
        id: p.id,
        shipmentId: p.shipmentId,
        trackingId: p.shipment?.trackingId ?? null,
        amount: p.amount,
        paymentStatus: p.paymentStatus,
        transactionId: p.transactionId,
        paidAt: p.paidAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit,
      },
    };
  };

  // This was the old single-step payment without Razorpay
  payService = async (shipmentId: number, customerId: number) => {
    //  Check shipment exists
    const shipment = await shipmentRepository.findShipmentById(shipmentId);
    if (!shipment) throw new ApiError(404, "Shipment not found");

    //  Customer can only pay for their own shipment
    if (shipment.customerId !== customerId) {
      throw new ApiError(403, "You can only pay for your own shipments");
    }

    //  Shipment must be PENDING to accept payment
    if (shipment.shipmentStatus !== "PENDING") {
      throw new ApiError(
        400,
        `Payment cannot be made. Shipment is already ${shipment.shipmentStatus}`,
      );
    }

    //  Prevent duplicate payment
    const existingPayment =
      await paymentRepository.findPaymentByShipmentId(shipmentId);
    if (existingPayment && existingPayment.paymentStatus === "PAID") {
      throw new ApiError(400, "Payment is already completed for this shipment");
    }

    // Generate a simulated transaction ID
    // In a real project this comes from Razorpay / Stripe webhook response
    const transactionId = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Create payment record directly as PAID -  simulation
    const payment = await paymentRepository.createPayment({
      shipmentId,
      customerId,
      amount: shipment.amount,
    });

    await paymentRepository.markAsPaid(payment.id, transactionId);

    //  Update shipment: paymentStatus  PAID, shipmentStatus CONFIRMED
    await shipmentRepository.updatePaymentAndStatus(
      shipmentId,
      "PAID",
      "CONFIRMED",
    );

    //  TRIGGER AUTO-ASSIGNMENT immediately after payment
    await autoAssignService.autoAssignAgentAndSlot(shipmentId, customerId);

    //  Fetch updated payment + shipment
    const updatedPayment =
      await paymentRepository.findPaymentByShipmentId(shipmentId);

    const updatedShipment =
      await shipmentRepository.findShipmentById(shipmentId);

    // payment success notification
    await Notification.create({
      userId: customerId,
      shipmentId,
      title: "Payment Successful",
      message: `Payment for shipment ${updatedShipment?.trackingId} was successful`,
      type: NOTIFICATION_TYPE.PAYMENT_UPDATE,
    });

    return {
      id: updatedPayment?.id,
      shipmentId: updatedPayment?.shipmentId,
      customerId: updatedPayment?.customerId,
      transactionId: updatedPayment?.transactionId,
      amount: updatedPayment?.amount,
      paymentStatus: updatedPayment?.paymentStatus,
      paidAt: updatedPayment?.paidAt,
      shipmentStatus: updatedShipment?.shipmentStatus,
      deliveryAgentId: updatedShipment?.deliveryAgentId,
      deliverySlotId: updatedShipment?.deliverySlotId,
    };
  };
}

export default new PaymentService();
