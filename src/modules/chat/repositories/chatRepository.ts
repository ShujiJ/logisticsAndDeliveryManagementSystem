import ChatMessage from "../models/chatModel";
import User from "../../auth/models/userModel";

class ChatRepository {
  async createMessage(payload: {
    shipmentId: number;
    senderId: number;
    senderRole: string;
    message: string;
  }) {
    return await ChatMessage.create(payload);
  }

  async findMessagesByShipmentId(
    shipmentId: number,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;

    const { count, rows } = await ChatMessage.findAndCountAll({
      where: { shipmentId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit,
      offset,
    });

    return { count, rows };
  }

  async findAllMessagesByShipmentId(
    shipmentId: number,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;

    const { count, rows } = await ChatMessage.findAndCountAll({
      where: { shipmentId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return { count, rows };
  }
}

export default new ChatRepository();
