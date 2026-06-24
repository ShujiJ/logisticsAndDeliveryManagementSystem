import chatRepository from "../repositories/chatRepository";
import ApiError from "../../../shared/utils/apiError";
import Shipment from "../../shipment/models/shipmentModel";
import DeliveryAgent from "../../deliveryAgent/models/deliveryAgentModel";
import User from "../../auth/models/userModel";
import { getIO } from "../../../socket/socketInstance";

const mapRoleToSenderRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    customer: "CUSTOMER",
    deliveryAgent: "DELIVERY_AGENT",
    admin: "ADMIN",
  };
  return roleMap[role] ?? role;
};

class ChatService {
  sendMessageService = async (
    shipmentId: number,
    senderId: number,
    senderRole: string,
    message: string,
  ) => {
    const shipment = await Shipment.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new ApiError(404, "Shipment not found");

    if (senderRole === "customer" && shipment.customerId !== senderId) {
      throw new ApiError(
        403,
        "You are not authorized to send messages for this shipment",
      );
    }

    if (senderRole === "deliveryAgent") {
      const agent = await DeliveryAgent.findOne({ where: { userId: senderId } });
      if (!agent || shipment.deliveryAgentId !== agent.id) {
        throw new ApiError(
          403,
          "You are not authorized to send messages for this shipment",
        );
      }
    }

    if (
      shipment.shipmentStatus === "COMPLETED" ||
      shipment.shipmentStatus === "CANCELLED" ||
      shipment.shipmentStatus === "DELIVERED"
    ) {
      throw new ApiError(403, "Chat is closed for this shipment");
    }

    const mappedRole = mapRoleToSenderRole(senderRole);

    const chatMessage = await chatRepository.createMessage({
      shipmentId,
      senderId,
      senderRole: mappedRole,
      message,
    });

    const sender = await User.findOne({
      where: { id: senderId },
      attributes: ["id", "name"],
    });

    const result = {
      id: chatMessage.id,
      shipmentId: chatMessage.shipmentId,
      senderId: chatMessage.senderId,
      senderName: sender?.name ?? null,
      senderRole: chatMessage.senderRole,
      message: chatMessage.message,
      createdAt: chatMessage.createdAt,
    };

    try {
      const io = getIO();
      io.to(`chat:${shipmentId}`).emit("new_message", result);
    } catch {
      // socket not yet initialized - safe to ignore
    }

    return result;
  };

  getMessagesService = async (
    shipmentId: number,
    userId: number,
    userRole: string,
    page: number,
    limit: number,
  ) => {
    const shipment = await Shipment.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new ApiError(404, "Shipment not found");

    if (userRole === "customer" && shipment.customerId !== userId) {
      throw new ApiError(403, "You are not authorized to view this chat");
    }

    if (userRole === "deliveryAgent") {
      const agent = await DeliveryAgent.findOne({ where: { userId } });
      if (!agent || shipment.deliveryAgentId !== agent.id) {
        throw new ApiError(403, "You are not authorized to view this chat");
      }
    }

    const { count, rows } = await chatRepository.findMessagesByShipmentId(
      shipmentId,
      page,
      limit,
    );

    const messages = rows.map((m: any) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender?.name ?? null,
      senderRole: m.senderRole,
      message: m.message,
      createdAt: m.createdAt,
    }));

    return {
      messages,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };

  getChatHistoryService = async (
    shipmentId: number,
    page: number,
    limit: number,
  ) => {
    const shipment = await Shipment.findOne({
      where: { id: shipmentId },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name"],
        },
        {
          model: DeliveryAgent,
          as: "deliveryAgent",
          attributes: ["id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!shipment) throw new ApiError(404, "Shipment not found");

    const { count, rows } = await chatRepository.findAllMessagesByShipmentId(
      shipmentId,
      page,
      limit,
    );

    const messages = rows.map((m: any) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender?.name ?? null,
      senderRole: m.senderRole,
      message: m.message,
      createdAt: m.createdAt,
    }));

    const s = shipment as any;

    return {
      messages,
      shipmentInfo: {
        shipmentId,
        shipmentStatus: shipment.shipmentStatus,
        customer: s.customer ? { id: s.customer.id, name: s.customer.name } : null,
        assignedAgent:
          s.deliveryAgent?.user
            ? { id: s.deliveryAgent.user.id, name: s.deliveryAgent.user.name }
            : null,
      },
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };
}

export default new ChatService();
