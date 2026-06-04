import notificationRepository from "../repositories/notificationRepository";
import ApiError from "../../../shared/utils/apiError";

class NotificationService {
  getMyNotificationsService = async (userId: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;

    const [{ count, rows }, unreadCount] = await Promise.all([
      notificationRepository.findNotificationsByUserId(userId, limit, offset),
      notificationRepository.countUnreadByUserId(userId),
    ]);

    const notifications = rows.map((n: any) => ({
      notificationId: n.id,
      shipmentId: n.shipmentId ?? null,
      trackingId: n.shipment?.trackingId ?? null,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    return {
      unreadCount,
      notifications,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };

  markAsReadService = async (notificationId: number, userId: number) => {
    const notification = await notificationRepository.findNotificationById(notificationId);

    if (!notification) throw new ApiError(404, "Notification not found");

    // User can only mark their own notification as read
    if (notification.userId !== userId) throw new ApiError(403, "You are not authorized to update this notification");

    await notificationRepository.markAsReadById(notificationId);
  };

  markAllAsReadService = async (userId: number) => {
    await notificationRepository.markAllAsReadByUserId(userId);
  };
}

export default new NotificationService();
