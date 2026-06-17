import { Request, Response } from "express";
import dashboardService from "../services/dashboardService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class DashboardController {
  getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 14 * 24 * 60 * 60 * 1000);

    toDate.setHours(23, 59, 59, 999);

    const data = await dashboardService.getAdminDashboardService(fromDate, toDate);

    return responseHandler(res, 200, "Admin dashboard fetched successfully", data);
  });

  getCustomerDashboard = asyncHandler(async (req: Request, res: Response) => {
    const customerId = (req as any).user.id;
    const data = await dashboardService.getCustomerDashboardService(customerId);
    return responseHandler(res, 200, "Customer dashboard fetched successfully", data);
  });

  getAgentDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data = await dashboardService.getAgentDashboardService(userId);
    return responseHandler(res, 200, "Agent dashboard fetched successfully", data);
  });
}

export default new DashboardController();
