import ShipmentTimeline from "../models/shipmentTimeLineModel";
import User from "../../auth/models/userModel";

class ShipmentTimelineRepository {
  // N Fetch all timeline entries for a given shipment, ordered oldest → newest
  // Includes the user who made each status change (name + role for display)
  findTimelineByShipmentId = async (shipmentId: number) => {
    return await ShipmentTimeline.findAll({
      where: { shipmentId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "updatedBy",
          attributes: ["id", "name", "role"],
        },
      ],
    });
  };
}

export default new ShipmentTimelineRepository();
