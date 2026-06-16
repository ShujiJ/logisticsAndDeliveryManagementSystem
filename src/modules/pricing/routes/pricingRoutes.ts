import express from "express";
import pricingController from "../controllers/pricingController";

const router = express.Router();

router.get("/rates", pricingController.getRates);

export default router;
