import { Request, Response } from "express";
import shipmentTimelineService from "../services/shipmentTimelineService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class ShipmentTimelineController {
  // Returns the full status history for a shipment — powers the tracking screen on frontend
  getShipmentTimeline = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.id);
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const timeline =
      await shipmentTimelineService.getShipmentTimelineService(
        shipmentId,
        userId,
        role,
      );

    return responseHandler(
      res,
      200,
      "Shipment timeline fetched successfully",
      timeline,
    );
  });
}

export default new ShipmentTimelineController();
