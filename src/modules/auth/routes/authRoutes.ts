import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import authController from "../controllers/authController";
import validate from "../../../shared/middlewares/validateMiddleware";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validations/authValidation";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/refreshToken", authController.refreshToken);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.patch("/updateProfile", authMiddleware, validate(updateProfileSchema), authController.updateProfile);
router.patch("/changePassword", authMiddleware, validate(changePasswordSchema), authController.changePassword);

export default router;
