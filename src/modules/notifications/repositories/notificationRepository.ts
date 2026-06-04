import Notification from "../models/notificationModel";
import Shipment from "../../shipment/models/shipmentModel";
import { CreateNotificationDto } from "../dto/notificationDto";

class NotificationRepository {
  async createNotification(payload: CreateNotificationDto) {
    return await Notification.create(payload);
  }

  async findNotificationsByUserId(userId: number, limit: number, offset: number) {
    return await Notification.findAndCountAll({
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
      limit,
      offset,
    });
  }

  async countUnreadByUserId(userId: number) {
    return await Notification.count({ where: { userId, isRead: false } });
  }

  async findNotificationById(id: number) {
    return await Notification.findByPk(id);
  }

  async markAsReadById(id: number) {
    return await Notification.update({ isRead: true }, { where: { id } });
  }

  async markAllAsReadByUserId(userId: number) {
    return await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } },
    );
  }
}

export default new NotificationRepository();
