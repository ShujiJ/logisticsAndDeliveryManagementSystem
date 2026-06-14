import { Op } from "sequelize";
import DeliveryAgent from "../../modules/deliveryAgent/models/deliveryAgentModel";
import DeliverySlot from "../../modules/deliverySlot/models/deliverySlotModel";

const SLOT_DURATION_HOURS = 1;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 21;

function generateAllSlots(): { date: string; startTime: string; endTime: string }[] {
  const now = new Date();
  const startHour = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
  const slots: { date: string; startTime: string; endTime: string }[] = [];

  const toLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (startHour >= WORK_END_HOUR) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDate = toLocalDateString(tomorrow);

    for (let hour = WORK_START_HOUR; hour + SLOT_DURATION_HOURS <= WORK_END_HOUR; hour++) {
      slots.push({
        date: tomorrowDate,
        startTime: `${String(hour).padStart(2, "0")}:00:00`,
        endTime: `${String(hour + SLOT_DURATION_HOURS).padStart(2, "0")}:00:00`,
      });
    }
  } else {
    const todayDate = toLocalDateString(now);
    const firstHour = Math.max(startHour, WORK_START_HOUR);

    for (let hour = firstHour; hour + SLOT_DURATION_HOURS <= WORK_END_HOUR; hour++) {
      slots.push({
        date: todayDate,
        startTime: `${String(hour).padStart(2, "0")}:00:00`,
        endTime: `${String(hour + SLOT_DURATION_HOURS).padStart(2, "0")}:00:00`,
      });
    }
  }

  return slots;
}

// Finds the next conflict-free 1-hour slot for a specific agent.
// Pass agent=null to search across the top 5 available agents (used by auto-assign).
export async function findAvailableSlotForAgent(agent: DeliveryAgent): Promise<{
  date: string;
  startTime: string;
  endTime: string;
} | null> {
  const slots = generateAllSlots();

  for (const { date, startTime, endTime } of slots) {
    const conflict = await DeliverySlot.findOne({
      where: {
        deliveryAgentId: agent.id,
        date,
        slotStatus: { [Op.in]: ["AVAILABLE", "ASSIGNED", "IN_PROGRESS"] },
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime },
      },
    });

    if (!conflict) {
      return { date, startTime, endTime };
    }
  }

  return null;
}

// Finds a conflict-free slot across up to `limit` available agents (auto-assign use case).
export async function findAvailableSlotAcrossAgents(limit: number): Promise<{
  chosenAgent: DeliveryAgent;
  date: string;
  startTime: string;
  endTime: string;
} | null> {
  const candidates = await DeliveryAgent.findAll({
    where: {
      isActive: true,
      availabilityStatus: "AVAILABLE",
      shipmentCount: { [Op.lt]: 8 },
    },
    order: [["shipmentCount", "ASC"]],
    limit,
  });

  const slots = generateAllSlots();

  for (const { date, startTime, endTime } of slots) {
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
        return { chosenAgent: candidate, date, startTime, endTime };
      }
    }
  }

  return null;
}
