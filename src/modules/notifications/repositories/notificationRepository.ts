import Notification from "../models/notificationModel";
import Shipment from "../../shipment/models/shipmentModel";
import { CreateNotificationDto } from "../dto/notificationDto";

class NotificationRepository {
  async createNotification(payload: CreateNotificationDto) {
    return await Notification.create(payload);
  }

  async findNotificationsByUserId(userId: number) {
    return await Notification.findAll({
      where: { userId },
      include: [
        {
          model: Shipment,
          as: "shipment",
          required: false,
          attributes: ["trackingId"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async markAllAsReadByUserId(userId: number) {
    return await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } },
    );
  }
}

export default new NotificationRepository();
