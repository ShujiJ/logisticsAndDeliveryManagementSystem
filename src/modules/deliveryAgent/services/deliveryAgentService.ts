import bcrypt from "bcrypt";
import { Roles } from "../../auth/constants/roles";
import { CreateDeliveryAgentDto } from "../dto/createDeliveryAgentDto";
import deliveryAgentRepository from "../repositories/deliveryAgentRepository";
import ApiError from "../../../shared/utils/apiError";
import Shipment from "../../shipment/models/shipmentModel";
import ShipmentTimeline from "../../shipmentTimeline/models/shipmentTimeLineModel";
import DeliverySlot from "../../deliverySlot/models/deliverySlotModel";
import DeliveryAgent from "../models/deliveryAgentModel";
import { findAvailableSlotForAgent } from "../../../shared/utils/findAvailableSlot";

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

  getAllDeliveryAgentsService = async (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const { rows, count } =
      await deliveryAgentRepository.getAllDeliveryAgentsRepository(limit, offset);

    return {
      agents: rows.map((agent: any) => {
        const json = agent.toJSON();
        return {
          ...json,
          agentId: agent.user?.id,
          agentName: agent.user?.name,
          agentEmail: agent.user?.email,
          deliveredCount: Number(json.deliveredCount ?? 0),
          delayedCount: Number(json.delayedCount ?? 0),
          user: undefined,
        };
      }),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit,
      },
    };
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

  // Admin deactivates a delivery agent
  deactivateAgentService = async (agentId: number) => {
    const agent = await deliveryAgentRepository.findDeliveryAgentById(agentId);
    if (!agent) throw new ApiError(404, "Delivery agent not found");
    if (!agent.isActive) throw new ApiError(400, "Delivery agent is already deactivated");

    await deliveryAgentRepository.deactivateAgentRepository(agentId);

    return { id: agentId, isActive: false };
  };

  //  Admin reassigns a different agent to a shipment

  reassignAgentService = async (
    shipmentId: number,
    newAgentId: number,
    adminUserId: number,
  ) => {
    // --- Step 1: Validate shipment ---
    const shipment = await Shipment.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new ApiError(404, "Shipment not found");

    const blockedStatuses = ["DELIVERED", "COMPLETED", "CANCELLED"];
    if (blockedStatuses.includes(shipment.shipmentStatus as string)) {
      throw new ApiError(
        400,
        `Reassignment not allowed. Shipment is already ${shipment.shipmentStatus}.`,
      );
    }

    // --- Validate new agent ---
    const newAgent = await deliveryAgentRepository.findDeliveryAgentById(newAgentId);
    if (!newAgent) throw new ApiError(404, "New delivery agent not found");
    if (!newAgent.isActive || newAgent.availabilityStatus !== "AVAILABLE") {
      throw new ApiError(400, "Selected agent is not available for assignment");
    }

    // Prevent reassigning to the same agent already on the shipment
    const previousAgentId = shipment.deliveryAgentId;
    if (previousAgentId === newAgentId) {
      throw new ApiError(400, "New agent is already assigned to this shipment");
    }

    // --- Step 2: Mark old slot as MISSED ---
    if (shipment.deliverySlotId) {
      await DeliverySlot.update(
        { slotStatus: "MISSED" },
        { where: { id: shipment.deliverySlotId } },
      );
    }

    // --- Step 3: Clean up old agent ---
    if (previousAgentId) {
      await deliveryAgentRepository.decrementShipmentCount(previousAgentId);

      // Restore availability if they were blocked due to max load
      const oldAgent = await deliveryAgentRepository.findDeliveryAgentById(previousAgentId);
      if (oldAgent && oldAgent.availabilityStatus === "UNAVAILABLE") {
        const refreshed = await DeliveryAgent.findByPk(previousAgentId);
        if (refreshed && refreshed.shipmentCount < 8) {
          await deliveryAgentRepository.updateAvailabilityStatus(previousAgentId, "AVAILABLE");
        }
      }
    }

    // --- Step 4: Generate a new slot for the new agent ---
    const slotTimes = await findAvailableSlotForAgent(newAgent);
    if (!slotTimes) {
      throw new ApiError(
        503,
        "No available delivery slot found for this agent today or tomorrow. Try again later.",
      );
    }

    const newSlot = await DeliverySlot.create({
      deliveryAgentId: newAgentId,
      date: slotTimes.date,
      startTime: slotTimes.startTime,
      endTime: slotTimes.endTime,
      slotStatus: "ASSIGNED",
    });

    // --- Step 5: Update the shipment ---
    await Shipment.update(
      {
        deliveryAgentId: newAgentId,
        deliverySlotId: newSlot.id,
        shipmentStatus: "ASSIGNED",
      },
      { where: { id: shipmentId } },
    );

    // --- Step 6: Update new agent load and availability ---
    await deliveryAgentRepository.incrementShipmentCount(newAgentId);
    const refreshedNew = await DeliveryAgent.findByPk(newAgentId);
    if (refreshedNew && refreshedNew.shipmentCount >= 8) {
      await deliveryAgentRepository.updateAvailabilityStatus(newAgentId, "UNAVAILABLE");
    }

    // --- Step 7: Write timeline entry ---
    await ShipmentTimeline.create({
      shipmentId,
      updatedByUserId: adminUserId,
      fromStatus: shipment.shipmentStatus,
      toStatus: "ASSIGNED",
      remarks: `Admin reassigned from agent ${previousAgentId ?? "none"} to agent ${newAgentId}. New slot: ${slotTimes.date} ${slotTimes.startTime}–${slotTimes.endTime}`,
    });

    return {
      shipmentId,
      previousAgentId: previousAgentId ?? null,
      newAgentId,
      newSlotId: newSlot.id,
      newSlot: {
        date: slotTimes.date,
        startTime: slotTimes.startTime,
        endTime: slotTimes.endTime,
      },
      shipmentStatus: "ASSIGNED",
      message: "Shipment successfully reassigned to new agent with a fresh delivery slot",
    };
  };
}

export default new DeliveryAgentService();
