import { fn, col, Op } from "sequelize";
import Shipment from "../../shipment/models/shipmentModel";
import Payment from "../../payment/models/paymentModel";
import DeliveryAgent from "../../deliveryAgent/models/deliveryAgentModel";
import DeliverySlot from "../../deliverySlot/models/deliverySlotModel";
import User from "../../auth/models/userModel";
import Complaint from "../../complaints/models/complaintModel";
import Notification from "../../notifications/models/notificationModel";
import ChatMessage from "../../chat/models/chatModel";

class DashboardRepository {
  async getShipmentCounts(fromDate: Date, toDate: Date) {
    const dateFilter = { createdAt: { [Op.between]: [fromDate, toDate] } };

    const [total, delivered, active, delayed, pending] = await Promise.all([
      Shipment.count({ where: { ...dateFilter } }),
      Shipment.count({
        where: {
          ...dateFilter,
          shipmentStatus: { [Op.in]: ["DELIVERED", "COMPLETED"] },
        },
      }),
      Shipment.count({
        where: {
          ...dateFilter,
          shipmentStatus: {
            [Op.in]: [
              "ASSIGNED",
              "CONFIRMED",
              "OUT_FOR_PICKUP",
              "PICKED_UP",
              "IN_TRANSIT",
              "OUT_FOR_DELIVERY",
            ],
          },
        },
      }),
      Shipment.count({ where: { ...dateFilter, shipmentStatus: "DELAYED" } }),
      Shipment.count({ where: { ...dateFilter, shipmentStatus: "PENDING" } }),
    ]);

    return { total, delivered, active, delayed, pending };
  }

  // Count of payment records grouped by paymentStatus within date range
  async getPaymentSummary(fromDate: Date, toDate: Date) {
    return (await Payment.findAll({
      attributes: ["paymentStatus", [fn("COUNT", col("id")), "count"]],
      where: { createdAt: { [Op.between]: [fromDate, toDate] } },
      group: ["paymentStatus"],
      raw: true,
    })) as any[];
  }

  // Fetch individual paid payment rows — grouping into periods is done in the service
  async getPaidPaymentsInRange(fromDate: Date, toDate: Date) {
    return await Payment.findAll({
      attributes: ["paidAt", "amount"],
      where: {
        paymentStatus: "PAID",
        paidAt: { [Op.between]: [fromDate, toDate] },
      },
      order: [["paidAt", "ASC"]],
    });
  }

  // All agents with their user name — activeShipments comes from shipmentCount column
  async getAllAgentsWithUser() {
    return await DeliveryAgent.findAll({
      attributes: ["id", "shipmentCount"],
      include: [{ model: User, as: "user", attributes: ["name"] }],
    });
  }

  // Total shipments ever assigned per agent
  async getTotalShipmentsPerAgent() {
    return (await Shipment.count({
      where: { deliveryAgentId: { [Op.not]: null } },
      group: ["deliveryAgentId"],
    })) as any[];
  }

  // Completed shipments per agent (DELIVERED or COMPLETED status)
  async getCompletedShipmentsPerAgent() {
    return (await Shipment.count({
      where: {
        deliveryAgentId: { [Op.not]: null },
        shipmentStatus: { [Op.in]: ["DELIVERED", "COMPLETED"] },
      },
      group: ["deliveryAgentId"],
    })) as any[];
  }

  // Latest 6 complaints with shipment and customer joined
  async getRecentComplaints() {
    return await Complaint.findAll({
      attributes: ["id", "description", "status", "createdAt", "updatedAt"],
      include: [
        {
          model: Shipment,
          as: "shipment",
          attributes: ["trackingId", "shipmentStatus"],
        },
        { model: User, as: "customer", attributes: ["name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 6,
    });
  }

  // customer dashboard

  async getCustomerShipmentCounts(customerId: number) {
    const [total, active, delivered, pending, pendingPayments] =
      await Promise.all([
        Shipment.count({ where: { customerId } }),
        Shipment.count({
          where: {
            customerId,
            shipmentStatus: {
              [Op.in]: [
                "ASSIGNED",
                "CONFIRMED",
                "OUT_FOR_PICKUP",
                "PICKED_UP",
                "IN_TRANSIT",
                "OUT_FOR_DELIVERY",
              ],
            },
          },
        }),
        Shipment.count({
          where: {
            customerId,
            shipmentStatus: { [Op.in]: ["DELIVERED", "COMPLETED"] },
          },
        }),
        Shipment.count({ where: { customerId, shipmentStatus: "PENDING" } }),
        Payment.count({ where: { customerId, paymentStatus: "PENDING" } }),
      ]);
    return { total, active, delivered, pending, pendingPayments };
  }

  async getCustomerUnreadNotifications(customerId: number) {
    return await Notification.count({
      where: { userId: customerId, isRead: false },
    });
  }

  async getCustomerRecentShipments(customerId: number) {
    return await Shipment.findAll({
      where: { customerId },
      attributes: [
        "id",
        "trackingId",
        "itemName",
        "shipmentStatus",
        "paymentStatus",
        "deliveryAddress",
        "deliveryCity",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
  }

  async getCustomerPaymentHistory(customerId: number) {
    return await Payment.findAll({
      where: { customerId },
      attributes: ["id", "shipmentId", "amount", "paymentStatus", "paidAt"],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
  }

  // async getCustomerRecentChats(customerId: number) {
  //   const shipments = await Shipment.findAll({
  //     where: { customerId },
  //     attributes: ["id", "trackingId"],
  //     raw: true,
  //   });

  //   if (!shipments.length) return { messages: [], trackingMap: {} };

  //   const ids = (shipments as any[]).map((s) => s.id);
  //   const trackingMap: Record<number, string> = {};
  //   (shipments as any[]).forEach((s) => {
  //     trackingMap[s.id] = s.trackingId;
  //   });

  //   const messages = await ChatMessage.findAll({
  //     where: { shipmentId: { [Op.in]: ids } },
  //     attributes: ["shipmentId", "message", "senderRole", "createdAt"],
  //     order: [["createdAt", "DESC"]],
  //   });

  //   return { messages, trackingMap };
  // }

  // delivery agent dashboard
  async getCustomerRecentChats(customerId: number) {
    return await ChatMessage.findAll({
      attributes: ["shipmentId", "message", "senderRole", "createdAt"],
      include: [
        {
          model: Shipment,
          as: "shipment",
          attributes: ["trackingId"],
          where: { customerId },
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }
  async getAgentByUserId(userId: number) {
    return await DeliveryAgent.findOne({
      where: { userId },
      attributes: ["id", "isActive", "availabilityStatus"],
    });
  }

  async getAgentShipmentCounts(agentId: number) {
    const [assigned, active, completed, delayed] = await Promise.all([
      Shipment.count({ where: { deliveryAgentId: agentId } }),
      Shipment.count({
        where: {
          deliveryAgentId: agentId,
          shipmentStatus: {
            [Op.in]: ["ASSIGNED", "CONFIRMED", "OUT_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"],
          },
        },
      }),
      Shipment.count({
        where: {
          deliveryAgentId: agentId,
          shipmentStatus: { [Op.in]: ["DELIVERED", "COMPLETED"] },
        },
      }),
      Shipment.count({
        where: {
          deliveryAgentId: agentId,
          shipmentStatus: "DELAYED",
        },
      }),
    ]);
    return { assigned, active, completed, delayed };
  }

  async getAgentTodaysSchedule(agentId: number) {
    const today = new Date().toLocaleDateString("en-CA"); // "2026-06-17"
    // const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return await Shipment.findAll({
      where: { deliveryAgentId: agentId, deliverySlotId: { [Op.not]: null } },
      attributes: [
        "id",
        "trackingId",
        "receiverName",
        "deliveryAddress",
        "deliveryCity",
        "shipmentStatus",
      ],
      include: [
        {
          model: DeliverySlot,
          as: "deliverySlot",
          where: { date: today },
          attributes: ["startTime", "endTime", "date"],
        },
      ],
    });
  }

  async getAgentCustomerMessages(agentId: number) {
    return await ChatMessage.findAll({
      where: { senderRole: "CUSTOMER" },
      include: [
        { model: User, as: "sender", attributes: ["name"] },
        {
          model: Shipment,
          as: "shipment",
          attributes: ["trackingId"],
          where: { deliveryAgentId: agentId },
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
  }
}

export default new DashboardRepository();
