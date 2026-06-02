import express from "express";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";
import { Roles } from "../../auth/constants/roles";
import dashboardController from "../controllers/dashboardController";

const router = express.Router();

// GET /api/v1/dashboard/admin?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD&groupBy=daily|weekly|monthly
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  dashboardController.getAdminDashboard,
);

// GET /api/v1/dashboard/agent — TODO: implement agent dashboard
// router.get("/agent", authMiddleware, roleMiddleware(Roles.DELIVERY_AGENT), dashboardController.getAgentDashboard);

export default router;
