import { Op, literal } from "sequelize";
import User from "../../auth/models/userModel";
import DeliveryAgent from "../models/deliveryAgentModel";

class DeliveryAgentRepository {
  createUserRepository = async (payload: any) => {
    return await User.create(payload);
  };

  createDeliveryAgentRepository = async (payload: any) => {
    return await DeliveryAgent.create(payload);
  };

  findDeliveryAgentById = async (deliveryAgentId: number) => {
    return await DeliveryAgent.findByPk(deliveryAgentId);
  };

  // Find agent profile row using the users table id (from JWT)
  findAgentByUserId = async (userId: number) => {
    return await DeliveryAgent.findOne({ where: { userId } });
  };

  incrementShipmentCount = async (deliveryAgentId: number) => {
    return await DeliveryAgent.increment(
      { shipmentCount: 1 },
      { where: { id: deliveryAgentId } },
    );
  };

  // also checks availabilityStatus 
  findAvailableAgent = async (zone?: string) => {
    const whereClause: any = {
      isActive: true,
      availabilityStatus: "AVAILABLE", // FIXED: was missing in original
      shipmentCount: { [Op.lt]: 8 },
    };

    // serviceZone filter — only apply when a zone is passed
    if (zone) {
      whereClause.serviceZone = zone;
    }

    return await DeliveryAgent.findOne({
      where: whereClause,
      order: [["shipmentCount", "ASC"]],
    });
  };

  //  find multiple available agents for retry logic in autoAssign
  findAvailableAgents = async (limit: number, zone?: string) => {
    const whereClause: any = {
      isActive: true,
      availabilityStatus: "AVAILABLE",
      shipmentCount: { [Op.lt]: 8 },
    };

    if (zone) {
      whereClause.serviceZone = zone;
    }

    return await DeliveryAgent.findAll({
      where: whereClause,
      order: [["shipmentCount", "ASC"]],
      limit,
    });
  };

  getAllDeliveryAgentsRepository = async (limit: number, offset: number) => {
    return await DeliveryAgent.findAndCountAll({
      attributes: [
        "id",
        "phoneNumber",
        "vehicleType",
        "shipmentCount",
        "availabilityStatus",
        "isActive",
        "serviceZone",
        "createdAt",
        [
          literal(`(SELECT COUNT(*) FROM shipments WHERE shipments.deliveryAgentId = DeliveryAgent.id AND shipments.shipmentStatus = 'DELIVERED')`),
          "deliveredCount",
        ],
        [
          literal(`(SELECT COUNT(*) FROM shipments WHERE shipments.deliveryAgentId = DeliveryAgent.id AND shipments.shipmentStatus = 'DELAYED')`),
          "delayedCount",
        ],
      ],
      include: [
        {
          association: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      limit,
      offset,
    });
  };

  decrementShipmentCount = async (agentId: number) => {
    return await DeliveryAgent.decrement(
      { shipmentCount: 1 },
      {
        where: {
          id: agentId,
        },
      },
    );
  };

  //  Update availabilityStatus — used by toggleMyAvailabilityService
  updateAvailabilityStatus = async (agentId: number, status: string) => {
    return await DeliveryAgent.update(
      { availabilityStatus: status },
      { where: { id: agentId } },
    );
  };

  toggleAgentStatusRepository = async (agentId: number, isActive: boolean) => {
    return await DeliveryAgent.update(
      { isActive },
      { where: { id: agentId } },
    );
  };
}

export default new DeliveryAgentRepository();
