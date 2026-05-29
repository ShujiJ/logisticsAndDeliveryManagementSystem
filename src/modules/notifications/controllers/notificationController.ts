import { Request, Response } from "express";
import notificationService from "../services/notificationService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class NotificationController {
  //  logged-in user's notifications with unread count
  getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await notificationService.getMyNotificationsService(userId);
    return responseHandler(res, 200, "Notifications fetched successfully", result);
  });

  // mark all notifications as read
  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await notificationService.markAllAsReadService(userId);
    return responseHandler(res, 200, "Notifications updated successfully", null);
  });
}

export default new NotificationController();
