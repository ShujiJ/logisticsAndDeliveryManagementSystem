import { Request, Response } from "express";
import dashboardService from "../services/dashboardService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class DashboardController {
  getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
    const { fromDate: fromQuery, toDate: toQuery } = req.query as {
      fromDate?: string;
      toDate?: string;
    };

    let fromDate: Date;
    let toDate: Date;

    if (!fromQuery && !toQuery) {
      toDate = new Date();
      fromDate = new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      if (!fromQuery || !toQuery) {
        return responseHandler(res, 400, "Both fromDate and toDate are required", null);
      }

      fromDate = new Date(fromQuery);
      toDate = new Date(toQuery);

      if (isNaN(fromDate.getTime())) {
        return responseHandler(res, 400, "Invalid fromDate", null);
      }
      if (isNaN(toDate.getTime())) {
        return responseHandler(res, 400, "Invalid toDate", null);
      }
      if (fromDate > toDate) {
        return responseHandler(res, 400, "fromDate must be before toDate", null);
      }
    }

    fromDate.setHours(0, 0, 0, 0);
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
