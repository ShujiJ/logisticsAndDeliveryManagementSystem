import DeliveryAgent from "../../deliveryAgent/models/deliveryAgentModel";
import DeliverySlot from "../../deliverySlot/models/deliverySlotModel";
import Shipment from "../models/shipmentModel";
import ShipmentTimeline from "../../shipmentTimeline/models/shipmentTimeLineModel";
import { Op } from "sequelize";

// Each agent handles at most this many active shipments at once.
const MAX_AGENT_LOAD = 8;

// 1-hour slots as per requirements (10–11 AM, 11–12 PM etc.)
// CHANGED: was 8 hours — requirements spec says 1-hour duration slots
const SLOT_DURATION_HOURS = 1;

// How many different agents to try before giving up (retry logic)
// retry across multiple agents if a slot conflict is found
const MAX_AGENT_RETRIES = 5;

class AutoAssignService {
  // Assigns agent + slot to the shipment and writes a timeline entry.
  autoAssignAgentAndSlot = async (
    shipmentId: number,
    systemUserId: number, // customer's userId — used as timeline actor
  ): Promise<void> => {
    try {
      

      // Read the ACTUAL current status of the shipment and reads real status
      const shipment = await Shipment.findOne({ where: { id: shipmentId } });

      console.log("[STEP 0] Shipment fetched:", shipment?.toJSON());

      if (!shipment) {
        console.warn(`[AutoAssign] Shipment ${shipmentId} not found.`);
        return;
      }

      const actualFromStatus = shipment.shipmentStatus ?? "CONFIRMED";

      const deliveryCity = shipment.deliveryCity;

      console.log("[STEP 1] Delivery City:", deliveryCity);

      // two-pass agent selection — prefer same-zone agent, then any agent
      let agent = await this.findAgent(deliveryCity);

      console.log("[STEP 2] Zone matched agent:", agent?.toJSON());

      if (!agent) {
        console.log(
          "[STEP 2 FALLBACK] No zone matched agent found. Trying any available agent...",
        );

        // Fallback: any active available agent regardless of zone
        agent = await this.findAgent(null);

        console.log("[STEP 2 FALLBACK] Fallback agent:", agent?.toJSON());
      }

      if (!agent) {
        console.warn(
          `[AutoAssign] No available agent for shipment ${shipmentId}. Will retry later.`,
        );

        const allAgents = await DeliveryAgent.findAll();

        console.log("[DEBUG] All delivery agents:");
        console.log(
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

      console.log("[STEP 3] Slot Result:", slotResult);

      if (!slotResult) {
        console.warn(
          `[AutoAssign] Could not find a free slot after ${MAX_AGENT_RETRIES} retries for shipment ${shipmentId}.`,
        );

        const allSlots = await DeliverySlot.findAll();

        console.log("[DEBUG] Existing slots:");
        console.log(
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

      console.log("[STEP 4] Creating slot...");
      console.log({
        chosenAgentId: chosenAgent.id,
        date,
        startTime,
        endTime,
      });

      //  Create the delivery slot (status: ASSIGNED immediately
      const slot = await DeliverySlot.create({
        deliveryAgentId: chosenAgent.id,
        date,
        startTime,
        endTime,
        slotStatus: "ASSIGNED",
      });

      console.log("[STEP 4 SUCCESS] Slot created:", slot.toJSON());

      // Update shipment: link agent + slot, move status to ASSIGNED 
      const updateResult = await Shipment.update(
        {
          deliveryAgentId: chosenAgent.id,
          deliverySlotId: slot.id,
          shipmentStatus: "ASSIGNED",
        },
        { where: { id: shipmentId } },
      );

      console.log("[STEP 5] Shipment update result:", updateResult);

      // VERIFY UPDATE
      const updatedShipment = await Shipment.findOne({
        where: { id: shipmentId },
      });

      console.log(
        "[STEP 5 VERIFY] Updated shipment:",
        updatedShipment?.toJSON(),
      );

      //  Increment agent workload counter 
      await DeliveryAgent.increment(
        { shipmentCount: 1 },
        { where: { id: chosenAgent.id } },
      );

      console.log(
        `[STEP 6] Incremented shipment count for agent ${chosenAgent.id}`,
      );

      // Write timeline entry with REAL fromStatus
      await ShipmentTimeline.create({
        shipmentId,
        updatedByUserId: systemUserId,
        fromStatus: actualFromStatus,
        toStatus: "ASSIGNED",
        remarks: `Auto-assigned to agent ${chosenAgent.id} (zone: ${chosenAgent.serviceZone ?? "any"}). Slot: ${date} ${startTime}–${endTime}`,
      });

      
    } catch (error) {
      
      console.error(error);

      throw error;
    }
  };

  //  find an available agent, optionally filtered by service zone ─
  // zone param — pass deliveryCity to match, pass null for any-zone fallback
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

    console.log("[findAgent] Where clause:", whereClause);

    const agent = await DeliveryAgent.findOne({
      where: whereClause,
      order: [["shipmentCount", "ASC"]],
    });

    console.log("[findAgent] Found agent:", agent?.toJSON());

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

    console.log(
      "[findNonConflictingSlot] Candidates:",
      candidates.map((c) => c.toJSON()),
    );

    const { date, startTime, endTime } = this.generateNextSlot();

    console.log("[findNonConflictingSlot] Generated slot:", {
      date,
      startTime,
      endTime,
    });

    for (const candidate of candidates) {
      console.log(
        `[findNonConflictingSlot] Checking conflicts for agent ${candidate.id}`,
      );

      const conflict = await DeliverySlot.findOne({
        where: {
          deliveryAgentId: candidate.id,
          date,
          slotStatus: { [Op.in]: ["AVAILABLE", "ASSIGNED", "IN_PROGRESS"] },
          startTime: { [Op.lt]: endTime },
          endTime: { [Op.gt]: startTime },
        },
      });

      console.log("[findNonConflictingSlot] Conflict:", conflict?.toJSON());

      if (!conflict) {
        console.log(
          `[findNonConflictingSlot] Agent ${candidate.id} is free`,
        );

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

  // ── Helper: produce today's next 1-hour slot window
  private generateNextSlot(): {
    date: string;
    startTime: string;
    endTime: string;
  } {
    const now = new Date();

    // Round up to the next even hour (e.g. 14:35 to  15:00)
    const startHour =
      now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();

    console.log("[generateNextSlot] Current time:", now);
    console.log("[generateNextSlot] Start hour:", startHour);

    // Working hours: 8 AM – 8 PM. If past window, push to tomorrow 9 AM.
    if (startHour >= 20 || startHour < 8) {
      const tomorrow = new Date(now);

      tomorrow.setDate(now.getDate() + 1);

      return {
        date: tomorrow.toISOString().split("T")[0]!,
        startTime: "09:00:00",
        endTime: `${String(9 + SLOT_DURATION_HOURS).padStart(2, "0")}:00:00`,
      };
    }

    const endHour = Math.min(startHour + SLOT_DURATION_HOURS, 20);

    return {
      date: now.toISOString().split("T")[0]!,
      startTime: `${String(startHour).padStart(2, "0")}:00:00`,
      endTime: `${String(endHour).padStart(2, "0")}:00:00`,
    };
  }
}

export default new AutoAssignService();