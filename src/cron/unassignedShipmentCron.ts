import cron from "node-cron";
import { Op } from "sequelize";
import Shipment from "../modules/shipment/models/shipmentModel";
import autoAssignService from "../modules/shipment/services/autoAssignService";
import {
  SHIPMENT_STATUS,
  PAYMENT_STATUS,
} from "../modules/shipment/constants/shipmentConstants";

const UNASSIGNED_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

const retryUnassignedShipments = async () => {
  try {
    const cutoffTime = new Date(Date.now() - UNASSIGNED_THRESHOLD_MS);

    const unassignedShipments = await Shipment.findAll({
      where: {
        shipmentStatus: SHIPMENT_STATUS.CONFIRMED,
        paymentStatus: PAYMENT_STATUS.PAID,
        deliveryAgentId: null,
        updatedAt: { [Op.lt]: cutoffTime },
      },
    });

    if (unassignedShipments.length === 0) {
      console.log("[UnassignedShipment] No pending unassigned shipments found.");
      return;
    }

    console.log(
      `[UnassignedShipment] Retrying auto-assign for ${unassignedShipments.length} shipment(s).`,
    );

    for (const shipment of unassignedShipments) {
      // Pass customerId so notifications reach the correct customer
      await autoAssignService.autoAssignAgentAndSlot(
        shipment.id!,
        shipment.customerId,
      );
    }

    console.log("[UnassignedShipment] Retry run complete.");
  } catch (error) {
    console.error("[UnassignedShipment] Error during retry run:", error);
  }
};

export const startUnassignedShipmentCron = () => {
  cron.schedule("0 * * * *", retryUnassignedShipments);
  console.log("[UnassignedShipment] Cron scheduled: every hour.");
};
