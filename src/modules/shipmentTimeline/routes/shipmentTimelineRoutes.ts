import express from "express";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";
import { Roles } from "../../auth/constants/roles";
import shipmentTimelineController from "../controllers/shipmentTimelineController";

const router = express.Router({ mergeParams: true });
// Mounted at /api/v1/shipments so the final path is GET /api/v1/shipments/:id/timeline

router.get(
  "/",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.CUSTOMER, Roles.DELIVERY_AGENT),
  shipmentTimelineController.getShipmentTimeline,
);

export default router;
