import cron from "node-cron";
import { Op } from "sequelize";
import Shipment from "../modules/shipment/models/shipmentModel";
import DeliverySlot from "../modules/deliverySlot/models/deliverySlotModel";
import ShipmentTimeline from "../modules/shipmentTimeline/models/shipmentTimeLineModel";
import Notification from "../modules/notifications/models/notificationModel";
import User from "../modules/auth/models/userModel";
import { SHIPMENT_STATUS } from "../modules/shipment/constants/shipmentConstants";
import { NOTIFICATION_TYPE } from "../modules/notifications/constants/notificationConstants";
import { Roles } from "../modules/auth/constants/roles";

const detectDelayedShipments = async () => {
  try {
    const now = new Date();
    const inTransitShipments = await Shipment.findAll({
      where: {
        shipmentStatus: {
          [Op.in]: [
            SHIPMENT_STATUS.OUT_FOR_PICKUP,
            SHIPMENT_STATUS.PICKED_UP,
            SHIPMENT_STATUS.IN_TRANSIT,
            SHIPMENT_STATUS.OUT_FOR_DELIVERY,
          ],
        },
        deliverySlotId: { [Op.ne]: null },
      },
      include: [
        {
          model: DeliverySlot,
          as: "deliverySlot", //matching association name
          required: true, //Fetch only shipments that actually have a matching delivery slot.
        },
      ],
    });
    //findAll always returns an array so check if it is empty or not
    if (inTransitShipments.length === 0) {
      console.log("[DelayDetection] No IN_TRANSIT shipments found.");
      return;
    }

    const adminUser = await User.findOne({ where: { role: Roles.ADMIN } });
    const systemActorId = adminUser?.id ?? 1;

    let delayedCount = 0;

    for (const shipment of inTransitShipments) {
      const slot = (shipment as any).deliverySlot as DeliverySlot; //treat as DeliverySlot instance
      if (!slot) continue;

      // Combine DATEONLY date and TIME endTime into a comparable DateTime
      const deadlineStr = `${slot.date}T${slot.endTime}`;
      const deadline = new Date(deadlineStr);

      if (now > deadline) {
        const previousStatus = shipment.shipmentStatus;

        await shipment.update({ shipmentStatus: SHIPMENT_STATUS.DELAYED });

        await ShipmentTimeline.create({
          shipmentId: shipment.id!,
          updatedByUserId: systemActorId,
          fromStatus: previousStatus,
          toStatus: SHIPMENT_STATUS.DELAYED,
          remarks: "Shipment delayed — delivery window exceeded",
        });

        await Notification.create({
          userId: shipment.customerId,
          shipmentId: shipment.id!,
          title: "Shipment Delayed",
          message: `Your shipment (${shipment.trackingId}) has been delayed. We apologize for the inconvenience.`,
          type: NOTIFICATION_TYPE.SHIPMENT_DELAYED,
        });

        delayedCount++;
      }
    }

    console.log(
      `[DelayDetection] Run complete — ${delayedCount} shipment(s) marked as DELAYED.`,
    );
  } catch (error) {
    console.error("[DelayDetection] Error during delay detection:", error);
  }
};

export const startDelayDetectionCron = () => {
  cron.schedule("*/15 * * * *", detectDelayedShipments);
  console.log("[DelayDetection] Cron scheduled: every 15 minutes.");
};
