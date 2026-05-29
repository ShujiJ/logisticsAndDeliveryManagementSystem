import notificationRepository from "../repositories/notificationRepository";

class NotificationService {
  getMyNotificationsService = async (userId: number) => {
    const notifications =
      await notificationRepository.findNotificationsByUserId(userId);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const formatted = notifications.map((n: any) => ({
      id: n.id,
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
      notifications: formatted,
    };
  };

  markAllAsReadService = async (userId: number) => {
    await notificationRepository.markAllAsReadByUserId(userId);
  };
}

export default new NotificationService();
