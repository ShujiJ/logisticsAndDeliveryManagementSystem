import express from "express";
import authMiddleware from "../../auth/middlewares/authMiddleware";
import roleMiddleware from "../../auth/middlewares/roleMiddleware";
import { Roles } from "../../auth/constants/roles";
import complaintController from "../controllers/complaintController";
import validate from "../../../shared/middlewares/validateMiddleware";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "../validations/complaintValidation";

const router = express.Router();

router.post(
  "/:shipmentId",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  validate(createComplaintSchema),
  complaintController.raiseComplaint,
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  complaintController.getAllComplaints,
);
router.get(
  "/me",
  authMiddleware,
  roleMiddleware(Roles.CUSTOMER),
  complaintController.getMyComplaints,
);
router.patch(
  "/:complaintId/status",
  authMiddleware,
  roleMiddleware(Roles.ADMIN),
  validate(updateComplaintStatusSchema),
  complaintController.updateComplaintStatus,
);

export default router;
