import express from "express";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";
import { Roles } from "../../auth/constants/roles";
import chatController from "../controllers/chatController";
import validate from "../../../shared/middlewares/validateMiddleware";
import { sendMessageSchema } from "../validations/chatValidation";

const router = express.Router();

//  send a message (customer and agent only)
router.post(
  "/:shipmentId",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER, Roles.DELIVERY_AGENT),
  validate(sendMessageSchema),
  chatController.sendMessage,
);

// admin only full chat history
router.get(
  "/:shipmentId/history",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  chatController.getChatHistory,
);

// get conversation (all roles) top to bottom
router.get(
  "/:shipmentId",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER, Roles.DELIVERY_AGENT, Roles.ADMIN),
  chatController.getMessages,
);

export default router;
