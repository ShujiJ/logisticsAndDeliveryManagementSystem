import { Request, Response } from "express";
import notificationService from "../services/notificationService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class NotificationController {
  //  logged-in user's notifications with unread count
  getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await notificationService.getMyNotificationsService(userId, page, limit);
    return responseHandler(res, 200, "Notifications fetched successfully", result);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notificationId = Number(req.params.id);
    const userId = (req as any).user.id;
    await notificationService.markAsReadService(notificationId, userId);
    return responseHandler(res, 200, "Notification marked as read", null);
  });

  // mark all notifications as read
  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await notificationService.markAllAsReadService(userId);
    return responseHandler(res, 200, "Notifications updated successfully", null);
  });
}

export default new NotificationController();
