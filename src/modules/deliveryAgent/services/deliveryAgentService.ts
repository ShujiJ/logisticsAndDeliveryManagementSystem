import bcrypt from "bcrypt";
import { Roles } from "../../auth/constants/roles";
import { CreateDeliveryAgentDto } from "../dto/createDeliveryAgentDto";
import deliveryAgentRepository from "../repositories/deliveryAgentRepository";
import ApiError from "../../../shared/utils/apiError";
import Shipment from "../../shipment/models/shipmentModel";
import ShipmentTimeline from "../../shipmentTimeline/models/shipmentTimeLineModel";

class DeliveryAgentService {
  createDeliveryAgentService = async (
    payload: CreateDeliveryAgentDto,
    adminId: number,
  ) => {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await deliveryAgentRepository.createUserRepository({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: Roles.DELIVERY_AGENT,
    });

    const deliveryAgent =
      await deliveryAgentRepository.createDeliveryAgentRepository({
        userId: user.id,
        phoneNumber: payload.phoneNumber,
        vehicleType: payload.vehicleType,
        vehicleNumber: payload.vehicleNumber,
        licenseNumber: payload.licenseNumber,
        serviceZone: payload.serviceZone,
        availabilityStatus: "AVAILABLE",
        shipmentCount: 0,
        createdByAdminId: adminId,
      });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      deliveryAgent,
    };
  };

  getAllDeliveryAgentsService = async () => {
    const agents =
      await deliveryAgentRepository.getAllDeliveryAgentsRepository();
    return agents.map((agent: any) => ({
      ...agent.toJSON(),
      agentId: agent.user?.id,
      agentName: agent.user?.name,
      agentEmail: agent.user?.email,
      user: undefined,
    }));
  };

  //  Agent toggles their OWN availability from their dashboard
  
  toggleMyAvailabilityService = async (userId: number) => {
    // Resolve userId to delivery_agents row
    const agent = await deliveryAgentRepository.findAgentByUserId(userId);
    if (!agent) throw new ApiError(404, "Delivery agent profile not found");

    const newStatus =
      agent.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

    await deliveryAgentRepository.updateAvailabilityStatus(agent.id, newStatus);

    return {
      agentId: agent.id,
      previousStatus: agent.availabilityStatus,
      currentStatus: newStatus,
      message: `You are now ${newStatus}`,
    };
  };

  //  Admin reassigns a different agent to a shipment
  
  reassignAgentService = async (
    shipmentId: number,
    newAgentId: number,
    adminUserId: number,
  ) => {
    const shipment = await Shipment.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new ApiError(404, "Shipment not found");

    //  reassignment only allowed before IN_TRANSIT
    const blockedStatuses = [
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED",
    ];
    if (blockedStatuses.includes(shipment.shipmentStatus as string)) {
      throw new ApiError(
        400,
        `Reassignment not allowed. Shipment is already ${shipment.shipmentStatus}. Reassignment is only allowed before IN_TRANSIT.`,
      );
    }

    // Verify new agent exists and is available
    const newAgent =
      await deliveryAgentRepository.findDeliveryAgentById(newAgentId);
    if (!newAgent) throw new ApiError(404, "New delivery agent not found");
    if (!newAgent.isActive || newAgent.availabilityStatus !== "AVAILABLE") {
      throw new ApiError(400, "Selected agent is not available for assignment");
    }

    const previousAgentId = shipment.deliveryAgentId;

    // Decrement old agent's load if there was one
    if (previousAgentId) {
      await deliveryAgentRepository.decrementShipmentCount(previousAgentId);
    }

    // Assign new agent and increment their load
    await Shipment.update(
      { deliveryAgentId: newAgentId, shipmentStatus: "ASSIGNED" },
      { where: { id: shipmentId } },
    );
    await deliveryAgentRepository.incrementShipmentCount(newAgentId);

    // Write timeline entry 
    await ShipmentTimeline.create({
      shipmentId,
      updatedByUserId: adminUserId,
      fromStatus: shipment.shipmentStatus,
      toStatus: "ASSIGNED",
      remarks: `Admin reassigned from agent ${previousAgentId ?? "none"} to agent ${newAgentId}`,
    });

    return {
      shipmentId,
      previousAgentId: previousAgentId ?? null,
      newAgentId,
      shipmentStatus: "ASSIGNED",
      message: "Shipment successfully reassigned to new agent",
    };
  };
}

export default new DeliveryAgentService();
