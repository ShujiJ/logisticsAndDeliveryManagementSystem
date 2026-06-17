import express from "express";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";
import { Roles } from "../../auth/constants/roles";
import dashboardController from "../controllers/dashboardController";

const router = express.Router();

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  dashboardController.getAdminDashboard,
  
);

router.get(
  "/customer",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  dashboardController.getCustomerDashboard,
);

router.get(
  "/deliveryAgent",
  authMiddleware,
  roleMiddleware(Roles.DELIVERY_AGENT),
  dashboardController.getAgentDashboard,
);

export default router;
