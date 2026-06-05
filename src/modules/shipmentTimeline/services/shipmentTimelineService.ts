// NEW - Service for shipment timeline GET
import shipmentTimelineRepository from "../repositories/shipmentTimelineRepository";
import shipmentRepository from "../../shipment/repositories/shipmentRepository";
import ApiError from "../../../shared/utils/apiError";
import { Roles } from "../../auth/constants/roles";
import deliveryAgentRepository from "../../deliveryAgent/repositories/deliveryAgentRepository";

class ShipmentTimelineService {
  // ADMIN: can view any shipment's timeline
  // CUSTOMER: can only view their own shipment's timeline
  // DELIVERY_AGENT: can view timeline for shipments assigned to them
  getShipmentTimelineService = async (
    shipmentId: number,
    userId: number,
    role: string,
  ) => {
    // Verify shipment exists
    const shipment = await shipmentRepository.findShipmentById(shipmentId);
    if (!shipment) {
      throw new ApiError(404, "Shipment not found");
    }

    // CUSTOMER can only view their own shipment's timeline
    if (role === Roles.CUSTOMER && shipment.customerId !== userId) {
      throw new ApiError(
        403,
        "You are not authorized to view this shipment's timeline",
      );
    }
    // After fixing the CUSTOMER check, add this:
    // if (role === Roles.DELIVERY_AGENT && shipment.deliveryAgentId !== userId) {
    //   throw new ApiError(
    //     403,
    //     "You are not authorized to view this shipment's timeline",
    //   );
    // }
    if (role === Roles.DELIVERY_AGENT) {
      const agentRecord =
        await deliveryAgentRepository.findAgentByUserId(userId);
      if (!agentRecord || shipment.deliveryAgentId !== agentRecord.id) {
        throw new ApiError(
          403,
          "You are not authorized to view this shipment's timeline",
        );
      }
    }
    const timeline =
      await shipmentTimelineRepository.findTimelineByShipmentId(shipmentId);

    //  Shape the response for frontend tracking screen
    return {
      shipmentId,
      trackingId: shipment.trackingId,
      currentStatus: shipment.shipmentStatus,
      timeline: timeline.map((entry: any) => ({
        timelineId: entry.id,
        fromStatus: entry.fromStatus ?? null,
        toStatus: entry.toStatus,
        remarks: entry.remarks ?? null,
        updatedAt: entry.createdAt,
        updatedBy: {
          id: entry.updatedBy?.id ?? null,
          name: entry.updatedBy?.name ?? null,
          role: entry.updatedBy?.role ?? null,
        },
      })),
    };
  };
}

export default new ShipmentTimelineService();
