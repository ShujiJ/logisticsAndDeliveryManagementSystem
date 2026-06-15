import { fn, col, Op } from "sequelize";
import Shipment from "../../shipment/models/shipmentModel";
import Payment from "../../payment/models/paymentModel";
import DeliveryAgent from "../../deliveryAgent/models/deliveryAgentModel";
import User from "../../auth/models/userModel";
import Complaint from "../../complaints/models/complaintModel";

class DashboardRepository {
  // Counts of shipments by status within the date range — separate count() per status, run in parallel
  async getShipmentCounts(fromDate: Date, toDate: Date) {
    const dateFilter = { createdAt: { [Op.between]: [fromDate, toDate] } };

    const [total, delivered, active, delayed, pending] = await Promise.all([
      Shipment.count({ where: { ...dateFilter } }),
      Shipment.count({ where: { ...dateFilter, shipmentStatus: { [Op.in]: ["DELIVERED", "COMPLETED"] } } }),
      Shipment.count({ where: { ...dateFilter, shipmentStatus: { [Op.in]: ["ASSIGNED", "CONFIRMED", "OUT_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"] } } }),
      Shipment.count({ where: { ...dateFilter, shipmentStatus: "DELAYED" } }),
      Shipment.count({ where: { ...dateFilter, shipmentStatus: "PENDING" } }),
    ]);

    return { total, delivered, active, delayed, pending };
  }

  // Sum of paid revenue within date range — uses paidAt so only actual payment time counts
  async getRevenue(fromDate: Date, toDate: Date): Promise<number> {
    const result = await Payment.findAll({
      attributes: [[fn("SUM", col("amount")), "total"]],
      where: {
        paymentStatus: "PAID",
        paidAt: { [Op.between]: [fromDate, toDate] },
      },
      raw: true,
    });
    return Number((result[0] as any)?.total ?? 0);
  }

  // Count of payment records grouped by paymentStatus within date range
  async getPaymentSummary(fromDate: Date, toDate: Date) {
    return await Payment.findAll({
      attributes: ["paymentStatus", [fn("COUNT", col("id")), "count"]],
      where: { createdAt: { [Op.between]: [fromDate, toDate] } },
      group: ["paymentStatus"],
      raw: true,
    }) as any[];
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
    return await Shipment.count({
      where: { deliveryAgentId: { [Op.not]: null } },
      group: ["deliveryAgentId"],
    }) as any[];
  }

  // Completed shipments per agent (DELIVERED or COMPLETED status)
  async getCompletedShipmentsPerAgent() {
    return await Shipment.count({
      where: {
        deliveryAgentId: { [Op.not]: null },
        shipmentStatus: { [Op.in]: ["DELIVERED", "COMPLETED"] },
      },
      group: ["deliveryAgentId"],
    }) as any[];
  }

  // Latest 10 complaints with shipment and customer joined
  async getRecentComplaints() {
    return await Complaint.findAll({
      attributes: ["id", "description", "status", "createdAt", "updatedAt"],
      include: [
        { model: Shipment, as: "shipment", attributes: ["trackingId", "shipmentStatus"] },
        { model: User, as: "customer", attributes: ["name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
  }

  // Latest 10 shipments with the customer's name joined
  async getRecentShipments() {
    return await Shipment.findAll({
      attributes: ["id", "trackingId", "shipmentStatus", "paymentStatus", "createdAt"],
      include: [{ model: User, as: "customer", attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
  }
}

export default new DashboardRepository();
