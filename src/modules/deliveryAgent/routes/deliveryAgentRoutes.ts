import express from "express";
import deliveryAgentController from "../controllers/deliveryAgentController";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";
import validate from "../../../shared/middlewares/validateMiddleware";
import { Roles } from "../../auth/constants/roles";
import { createDeliveryAgentValidation } from "../validations/createDeliveryAgentValidation";

const router = express.Router();

// Create delivery agent — Admin only
router.post(
  "/",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  validate(createDeliveryAgentValidation),
  deliveryAgentController.createDeliveryAgent,
);

// List all delivery agents — Admin only
router.get(
  "/",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  deliveryAgentController.getAllDeliveryAgents,
);

//  Agent toggles their OWN availability (AVAILABLE - UNAVAILABLE)

router.patch(
  "/myAvailability",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_AGENT),
  deliveryAgentController.toggleMyAvailability,
);

// Deactivate a delivery agent — Admin only
router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  deliveryAgentController.deactivateAgent,
);

//Reassign a different agent to a shipment — Admin only

router.patch(
  "/reassign/:shipmentId",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  deliveryAgentController.reassignAgent,
);

export default router;
