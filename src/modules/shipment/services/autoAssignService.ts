import DeliveryAgent from "../../deliveryAgent/models/deliveryAgentModel";
import DeliverySlot from "../../deliverySlot/models/deliverySlotModel";
import Shipment from "../models/shipmentModel";
import ShipmentTimeline from "../../shipmentTimeline/models/shipmentTimeLineModel";
import { Op } from "sequelize";
import User from "../../auth/models/userModel";
import Notification from "../../notifications/models/notificationModel";
import { NOTIFICATION_TYPE } from "../../notifications/constants/notificationConstants";

const MAX_AGENT_LOAD = 8;

// 1-hour slots as per requirements (10–11 AM, 11–12 PM etc.)
const SLOT_DURATION_HOURS = 1;

// How many different agents to try before giving up (retry logic)
const MAX_AGENT_RETRIES = 5;

class AutoAssignService {
  autoAssignAgentAndSlot = async (
    shipmentId: number,
    systemUserId: number, // customer's userId — used as timeline actor
  ): Promise<void> => {
    try {
      // Read the ACTUAL current status of the shipment and reads real status
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
        // Fallback: any active available agent regardless of zone
        agent = await this.findAgent(null);
      }

      if (!agent) {
        console.warn(
          `[AutoAssign] No available agent for shipment ${shipmentId}. Will retry later.`,
        );

        const allAgents = await DeliveryAgent.findAll();

        console.log(
          "[DEBUG] All delivery agents:",
          allAgents.map((a) => ({
            id: a.id,
            isActive: a.isActive,
            availabilityStatus: a.availabilityStatus,
            shipmentCount: a.shipmentCount,
            serviceZone: a.serviceZone,
          })),
        );

        return;
      }

      // Find a non-conflicting slot with retry across agents
      const slotResult = await this.findNonConflictingSlot(
        agent.id,
        deliveryCity,
        shipmentId,
      );

      if (!slotResult) {
        console.warn(
          `[AutoAssign] Could not find a free slot after ${MAX_AGENT_RETRIES} retries for shipment ${shipmentId}.`,
        );

        const allSlots = await DeliverySlot.findAll();

        console.log(
          "[DEBUG] Existing slots:",
          allSlots.map((s) => ({
            id: s.id,
            deliveryAgentId: s.deliveryAgentId,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            slotStatus: s.slotStatus,
          })),
        );

        return;
      }

      const { chosenAgent, date, startTime, endTime } = slotResult;

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
        remarks: `Auto-assigned to agent ${chosenAgent.id} (zone: ${chosenAgent.serviceZone ?? "any"}). Slot: ${date} ${startTime}–${endTime}`,
      });

      // NOTIFY CUSTOMER — AGENT ASSIGNED
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

      //  availabilityStatus check was missing - "Unavailable agents cannot receive new assignments"
      availabilityStatus: "AVAILABLE",

      shipmentCount: { [Op.lt]: MAX_AGENT_LOAD },
    };

    // only add zone filter when a zone is provided
    if (zone) {
      whereClause.serviceZone = zone;
    }

    const agent = await DeliveryAgent.findOne({
      where: whereClause,
      order: [["shipmentCount", "ASC"]],
    });

    return agent;
  };

  // Helper: try up to MAX_AGENT_RETRIES agents to find a conflict-free slot
  // full retry logic — if agent A has a conflict, tries agent B, C etc.
  private findNonConflictingSlot = async (
    firstAgentId: number,
    deliveryCity: string,
    shipmentId: number,
  ): Promise<{
    chosenAgent: DeliveryAgent;
    date: string;
    startTime: string;
    endTime: string;
  } | null> => {
    const candidates = await DeliveryAgent.findAll({
      where: {
        isActive: true,
        availabilityStatus: "AVAILABLE",
        shipmentCount: { [Op.lt]: MAX_AGENT_LOAD },
      },
      order: [["shipmentCount", "ASC"]],
      limit: MAX_AGENT_RETRIES,
    });

    const { date, startTime, endTime } = this.generateNextSlot();

    for (const candidate of candidates) {
      const conflict = await DeliverySlot.findOne({
        where: {
          deliveryAgentId: candidate.id,
          date,
          slotStatus: { [Op.in]: ["AVAILABLE", "ASSIGNED", "IN_PROGRESS"] },
          startTime: { [Op.lt]: endTime },
          endTime: { [Op.gt]: startTime },
        },
      });

      if (!conflict) {
        return {
          chosenAgent: candidate,
          date,
          startTime,
          endTime,
        };
      }

      console.warn(
        `[AutoAssign] Slot conflict for agent ${candidate.id} on ${date} ${startTime}–${endTime}. Trying next agent.`,
      );
    }

    return null;
  };

  // Helper: produce today's next 1-hour slot window
  private generateNextSlot(): {
    date: string;
    startTime: string;
    endTime: string;
  } {
    const now = new Date();

    // Round up to the next even hour (e.g. 14:35 to 15:00)
    const startHour =
      now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();

    // Working hours: 8 AM – 8 PM. If past window, push to tomorrow 9 AM.
    if (startHour >= 20 || startHour < 8) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      return {
        date: this.toLocalDateString(tomorrow), // NEW: local date instead of toISOString()
        startTime: "09:00:00",
        endTime: `${String(9 + SLOT_DURATION_HOURS).padStart(2, "0")}:00:00`,
      };
    }

    const endHour = Math.min(startHour + SLOT_DURATION_HOURS, 20);

    return {
      date: this.toLocalDateString(now),  
      startTime: `${String(startHour).padStart(2, "0")}:00:00`,
      endTime: `${String(endHour).padStart(2, "0")}:00:00`,
    };
  }

  // returns local date string instead of UTC to keep date consistent with local getHours() used for slot times
  private toLocalDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export default new AutoAssignService();
