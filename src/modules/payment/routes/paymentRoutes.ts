import express from "express";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";
import { Roles } from "../../auth/constants/roles";
import paymentController from "../controllers/paymentController";

const router = express.Router();

// Customer calls this to get Razorpay order ID for checkout
router.post(
  "/initiate/:shipmentId",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  paymentController.initiatePayment,
);

// Customer calls this after successful Razorpay checkout
router.post(
  "/verify/:shipmentId",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  paymentController.verifyPayment,
);

// Customer fetches their own payment history with pagination
router.get(
  "/myPayments",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  paymentController.getMyPayments,
);

// Get payment details for a shipment
router.get(
  "/:shipmentId",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER, Roles.ADMIN),
  paymentController.getPayment,
);

// Payment simulation endpoint — single-step payment without Razorpay
router.post(
  "/pay/:shipmentId",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  paymentController.pay,
);

export default router;
