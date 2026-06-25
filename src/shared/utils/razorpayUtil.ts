import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../../config/env";

//  Initialize Razorpay instance with credentials
const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

class RazorpayUtil {
  // Create a Razorpay order for a shipment payment
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
        amount: amount * 100, //  Convert to paise (Razorpay uses smallest currency unit)
        currency: "INR",
        receipt: `shipment_${shipmentId}`, // Unique receipt ID for tracking
        //  Metadata to link order to shipment and customer
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
      //  Catch and log Razorpay API errors
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  };

  verifyPaymentSignature = (
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean => {
    try {
      // Create HMAC SHA256 hash of orderId|paymentId with key secret
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      //  Compare signature from frontend with expected signature
      return expectedSignature === signature;
    } catch (error) {
      console.error("Error verifying payment signature:", error);
      return false;
    }
  };

  //  Fetch payment details from Razorpay using payment ID
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

  refundPayment = async (razorpayPaymentId: string, amountInRupees: number) => {
    try {
      const refund = await razorpayInstance.payments.refund(razorpayPaymentId, {
        amount: Math.round(amountInRupees * 100), // convert rupees to paise
      });
      return refund;
    } catch (error) {
      console.error("Error processing Razorpay refund:", error);
      throw error;
    }
  };
}

export default new RazorpayUtil();
