import { Router } from "express";
import { Roles } from "../constants/roles";
import authMiddleware from "../middlewares/authMiddleware";
import authController from "../controllers/authController";
import validate from "../../../shared/middlewares/validateMiddleware";
import { registerSchema, loginSchema } from "../validations/authValidation";
import roleMiddleware from "../middlewares/roleMiddleware";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/refreshToken", authController.refreshToken);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);

export default router;
