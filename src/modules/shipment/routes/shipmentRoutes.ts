import express from "express";
import { Roles } from "../../auth/constants/roles";
import shipmentController from "../controllers/shipmentController";
import validate from "../../../shared/middlewares/validateMiddleware";
import { createShipmentValidation } from "../validations/createShipmentValidation";
import { updateShipmentValidation } from "../validations/updateShipmentValidation";
import { updateShipmentStatusValidation } from "../validations/updateShipmentStatusValidation";
import { verifyOtpValidation } from "../validations/verifyOtpValidation";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";
import shipmentTimelineRoutes from "../../shipmentTimeline/routes/shipmentTimelineRoutes";
const router = express.Router();

// router.use((req, res, next) => {
//   console.log("SHIPMENT ROUTER HIT:", req.method, req.path);
//   next();
// });

// CREATE SHIPMENT — customer or admin
router.post(
  "/",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.CUSTOMER),
  validate(createShipmentValidation),
  shipmentController.createShipment,
);

// GET MY SHIPMENTS — customer sees their own
router.get(
  "/myShipments",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  shipmentController.getMyShipments,
);

// GET MY DELIVERIES — delivery agent sees their assigned shipments
// Must be before /:id so Express does not treat "myDeliveries" as an id param
router.get(
  "/myDeliveries",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_AGENT),
  shipmentController.getMyDeliveries,
);
// GET ALL SHIPMENTS — admin only
router.get(
  "/",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  shipmentController.getAllShipments,
);

// GET SHIPMENT BY ID — admin or customer (customer can only access their own)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.CUSTOMER),
  shipmentController.getShipmentById,
);

// UPDATE SHIPMENT — customer only, allowed while both statuses are PENDING
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  validate(updateShipmentValidation),
  shipmentController.updateShipment,
);

// Auto-assignment is now triggered automatically inside paymentService.payService()
//  GET /api/v1/shipments/:id/timeline — full status history for a shipment
router.use("/:id/timeline", shipmentTimelineRoutes);

router.patch(
  "/status/:id",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_AGENT, Roles.ADMIN),
  validate(updateShipmentStatusValidation),
  shipmentController.updateShipmentStatus,
);

// SEND DELIVERY OTP — assigned agent or admin
router.post(
  "/:id/send-otp",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_AGENT, Roles.ADMIN),
  shipmentController.sendOtp,
);

// VERIFY DELIVERY OTP — assigned agent only
router.post(
  "/:id/verify-otp",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_AGENT),
  validate(verifyOtpValidation),
  shipmentController.verifyOtp,
);

export default router;
