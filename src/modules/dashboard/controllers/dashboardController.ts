import { Request, Response } from "express";
import dashboardService from "../services/dashboardService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class DashboardController {
  getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
    const { fromDate: fromStr, toDate: toStr, groupBy = "daily" } = req.query as Record<string, string>;

    // Default: last 30 days when no date range is provided
    const toDate = toStr ? new Date(toStr) : new Date();
    const fromDate = fromStr
      ? new Date(fromStr)
      : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Include the full final day (up to 23:59:59.999)
    toDate.setHours(23, 59, 59, 999);

    const data = await dashboardService.getAdminDashboardService(fromDate, toDate, groupBy);

    return responseHandler(res, 200, "Admin dashboard fetched successfully", data);
  });
}

export default new DashboardController();
