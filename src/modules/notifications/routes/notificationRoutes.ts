import express from "express";
import { Roles } from "../../auth/constants/roles";
import notificationController from "../controllers/notificationController";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.CUSTOMER),
  notificationController.getMyNotifications,
);

router.patch(
  "/read/:id",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.CUSTOMER),
  notificationController.markAsRead,
);

router.patch(
  "/readAll",
  authMiddleware,
  roleMiddleware(Roles.ADMIN, Roles.CUSTOMER),
  notificationController.markAllAsRead,
);

export default router;
