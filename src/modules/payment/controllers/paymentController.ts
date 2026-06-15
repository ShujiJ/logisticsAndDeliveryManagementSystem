import { Request, Response } from "express";
import asyncHandler from "../../../shared/handlers/asyncHandler";
import responseHandler from "../../../shared/handlers/responseHandler";
import paymentService from "../services/paymentService";
import razorpayUtil from "../../../shared/utils/razorpayUtil";
import ApiError from "../../../shared/utils/apiError";

class PaymentController {
  // Returns order ID to be used by frontend checkout
  initiatePayment = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const customerId = (req as any).user.id;

    const orderDetails = await paymentService.initiatePaymentService(
      shipmentId,
      customerId,
    );

    return responseHandler(
      res,
      200,
      "Payment initiated. Proceed to Razorpay checkout.",
      orderDetails,
    );
  });

  // Customer verifies payment after successful checkout
  verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const customerId = (req as any).user.id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    //  Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new ApiError(400, "Missing Razorpay payment details");
    }

    const payment = await paymentService.verifyPaymentService(
      shipmentId,
      customerId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    return responseHandler(
      res,
      200,
      "Payment verified successfully. Agent is being assigned to your shipment.",
      payment,
    );
  });

  // Customer fetches their own payment history
  getMyPayments = asyncHandler(async (req: Request, res: Response) => {
    const customerId = (req as any).user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await paymentService.getMyPaymentsService(customerId, page, limit);
    return responseHandler(res, 200, "Payment history fetched successfully", result);
  });

  // Customer or admin fetches payment details
  getPayment = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const customerId = (req as any).user.id;
    const role = (req as any).user.role;
    const payment = await paymentService.getPaymentByShipmentService(
      shipmentId,
      customerId,
      role,
    );
    return responseHandler(res, 200, "Payment details fetched", payment);
  });

  // Single payment call without Razorpay
  // This processes payment immediately without external gateway
  pay = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const customerId = (req as any).user.id;
    const payment = await paymentService.payService(shipmentId, customerId);
    return responseHandler(
      res,
      200,
      "Payment successful. Agent is being assigned to your shipment.",
      payment,
    );
  });
}

export default new PaymentController();
