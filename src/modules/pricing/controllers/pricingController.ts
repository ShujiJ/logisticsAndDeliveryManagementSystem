import { Request, Response } from "express";
import pricingService from "../services/pricingService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class PricingController {
  getRates = asyncHandler(async (_req: Request, res: Response) => {
    const rates = pricingService.getPricingRates();
    return responseHandler(res, 200, "Pricing rates fetched successfully", rates);
  });
}

export default new PricingController();
