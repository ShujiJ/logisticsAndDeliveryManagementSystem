// NEW: Razorpay payment gateway integration
import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../../config/env";

// NEW: Initialize Razorpay instance with credentials
const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

class RazorpayUtil {
  // NEW: Create a Razorpay order for a shipment payment
  // Returns order details that frontend can use to open Razorpay checkout
  createOrder = async (
    amount: number, // Amount in paise (multiply by 100 for actual amount)
    shipmentId: number,
    customerId: number,
    customerEmail: string,
    customerPhone: string,
  ) => {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amount * 100, // NEW: Convert to paise (Razorpay uses smallest currency unit)
        currency: "INR",
        receipt: `shipment_${shipmentId}`, // NEW: Unique receipt ID for tracking
        // NEW: Metadata to link order to shipment and customer
        notes: {
          shipmentId: shipmentId.toString(),
          customerId: customerId.toString(),
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID, // NEW: Send key ID to frontend for checkout
        customerEmail,
        customerPhone,
        shipmentId,
      };
    } catch (error) {
      // NEW: Catch and log Razorpay API errors
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  };

  // webhooks -
  // validateWebhookSignature = (body: string, signature: string): boolean => {
  //   try {
  //     const hash = crypto
  //       .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
  //       .update(body)
  //       .digest("hex");
  //     return hash === signature;
  //   } catch (error) {
  //     console.error("Error validating webhook signature:", error);
  //     return false;
  //   }
  // };

  // NEW: Verify payment signature sent from frontend after checkout
  // Called after successful checkout on frontend
  verifyPaymentSignature = (
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean => {
    try {
      // NEW: Create HMAC SHA256 hash of orderId|paymentId with key secret
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      // NEW: Compare signature from frontend with expected signature
      return expectedSignature === signature;
    } catch (error) {
      console.error("Error verifying payment signature:", error);
      return false;
    }
  };

  // NEW: Fetch payment details from Razorpay using payment ID
  // Used to get complete payment info for logging and verification
  fetchPaymentDetails = async (paymentId: string) => {
    try {
      const payment = await razorpayInstance.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error("Error fetching payment details:", error);
      throw error;
    }
  };

  // NEW: Fetch order details from Razorpay using order ID
  // Used to verify order status and details
  fetchOrderDetails = async (orderId: string) => {
    try {
      const order = await razorpayInstance.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  };

  capturePayment = async (paymentId: string, amount: number) => {
    try {
      // Amount must be in paise (multiply by 100)
      const captureAmount = Math.round(amount * 100);
      // Call Razorpay API with correct parameters
      const payment = await razorpayInstance.payments.capture(
        paymentId, // Payment ID from Razorpay
        captureAmount, // Amount in paise
        "INR", // Currency code (REQUIRED - was missing!)
      );
      return payment;
    } catch (error) {
      console.error("Error capturing payment:", error);
      throw error;
    }
  };
}

export default new RazorpayUtil();
