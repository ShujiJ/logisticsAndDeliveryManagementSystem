import DeliveryAgent from "../../deliveryAgent/models/deliveryAgentModel";
import DeliverySlot from "../../deliverySlot/models/deliverySlotModel";
import Shipment from "../models/shipmentModel";
import ShipmentTimeline from "../../shipmentTimeline/models/shipmentTimeLineModel";
import { Op } from "sequelize";
import User from "../../auth/models/userModel";
import Notification from "../../notifications/models/notificationModel";
import { NOTIFICATION_TYPE } from "../../notifications/constants/notificationConstants";
import { findAvailableSlotAcrossAgents } from "../../../shared/utils/findAvailableSlot";

const MAX_AGENT_LOAD = 8;
const MAX_AGENT_RETRIES = 5;

class AutoAssignService {
  autoAssignAgentAndSlot = async (
    shipmentId: number,
    systemUserId: number,
  ): Promise<void> => {
    try {
      const shipment = await Shipment.findOne({ where: { id: shipmentId } });

      if (!shipment) {
        console.warn(`[AutoAssign] Shipment ${shipmentId} not found.`);
        return;
      }

      const actualFromStatus = shipment.shipmentStatus ?? "CONFIRMED";

      const deliveryCity = shipment.deliveryCity;

      // two-pass agent selection — prefer same-zone agent, then any agent
      let agent = await this.findAgent(deliveryCity);

      if (!agent) {
        // any active available agent regardless of zone
        agent = await this.findAgent(null);
      }

      if (!agent) {
        console.warn(
          `[AutoAssign] No available agent for shipment ${shipmentId}. Will retry later.`,
        );

        return;
      }

      // Find a non-conflicting slot with retry across agents
      const slotResult = await findAvailableSlotAcrossAgents(MAX_AGENT_RETRIES);

      if (!slotResult) {
        console.warn(
          `[AutoAssign] Could not find a free slot after ${MAX_AGENT_RETRIES} retries for shipment ${shipmentId}.`,
        );

        return;
      }

      const { chosenAgent, date, startTime, endTime } = slotResult;

      // Re-validate agent before assignment
      const updatedAgent = await DeliveryAgent.findByPk(chosenAgent.id);

      if (
        !updatedAgent ||
        !updatedAgent.isActive ||
        updatedAgent.availabilityStatus !== "AVAILABLE" ||
        updatedAgent.shipmentCount >= MAX_AGENT_LOAD
      ) {
        console.warn(
          `[AutoAssign] Agent ${chosenAgent.id} is no longer valid for shipment ${shipmentId}. isActive: ${updatedAgent?.isActive}, status: ${updatedAgent?.availabilityStatus}`,
        );
        return;
      }

      //  Create the delivery slot (status: ASSIGNED immediately
      const slot = await DeliverySlot.create({
        deliveryAgentId: chosenAgent.id,
        date,
        startTime,
        endTime,
        slotStatus: "ASSIGNED",
      });

      // Update shipment: link agent + slot, move status to ASSIGNED
      await Shipment.update(
        {
          deliveryAgentId: chosenAgent.id,
          deliverySlotId: slot.id,
          shipmentStatus: "ASSIGNED",
        },
        { where: { id: shipmentId } },
      );

      //  Increment agent workload counter
      await DeliveryAgent.increment(
        { shipmentCount: 1 },
        { where: { id: chosenAgent.id } },
      );

      const adminUser = await User.findOne({ where: { role: "admin" } });
      const actorId = adminUser?.id ?? systemUserId;

      await ShipmentTimeline.create({
        shipmentId,
        updatedByUserId: actorId,
        fromStatus: actualFromStatus,
        toStatus: "ASSIGNED",
        // remarks: `Auto-assigned to agent ${chosenAgent.id} (zone: ${chosenAgent.serviceZone ?? "any"}). Slot: ${date} ${startTime}–${endTime}`,
        remarks: `Auto-assigned to agent ${chosenAgent.id}. Slot: ${date} ${startTime}–${endTime}`,
      });

      // Notification to the customer — AGENT ASSIGNED
      const agentUser = await User.findByPk(chosenAgent.userId, {
        attributes: ["name"],
      });
      await Notification.create({
        userId: systemUserId,
        shipmentId,
        title: "Agent Assigned",
        message: `Your shipment ${shipment.trackingId} has been assigned to ${agentUser?.name ?? `Agent #${chosenAgent.id}`}`,
        type: NOTIFICATION_TYPE.AGENT_ASSIGNED,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  //  find an available agent, optionally filtered by service zone and pass null for any-zone fallback
  private findAgent = async (zone: string | null) => {
    const whereClause: any = {
      isActive: true,
      availabilityStatus: "AVAILABLE",
      shipmentCount: { [Op.lt]: MAX_AGENT_LOAD },
    };

    if (zone) {
      whereClause.serviceZone = zone;
    }

    return await DeliveryAgent.findOne({
      where: whereClause,
      order: [["shipmentCount", "ASC"]],
    });
  };
}

export default new AutoAssignService();
