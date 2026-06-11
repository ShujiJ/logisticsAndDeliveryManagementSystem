import { Request, Response } from "express";
import shipmentService from "../services/shipmentService";
import responseHandler from "../../../shared/handlers/responseHandler";
import asyncHandler from "../../../shared/handlers/asyncHandler";

class ShipmentController {
  createShipment = asyncHandler(async (req: Request, res: Response) => {
    const customerId = (req as any).user.id;
    const shipment = await shipmentService.createShipmentService(
      req.body,
      customerId,
    );
    return responseHandler(res, 201, "Shipment created successfully", shipment);
  });

  getMyShipments = asyncHandler(async (req: Request, res: Response) => {
    const customerId = (req as any).user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await shipmentService.getMyShipmentsService(
      customerId,
      page,
      limit,
    );
    return responseHandler(res, 200, "Shipments fetched successfully", result);
  });

  getShipmentById = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.id);
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const shipment = await shipmentService.getShipmentByIdService(
      shipmentId,
      userId,
      role,
    );
    return responseHandler(res, 200, "Shipment fetched successfully", shipment);
  });

  getAllShipments = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await shipmentService.getAllShipmentsService(page, limit);
    return responseHandler(
      res,
      200,
      "All shipments fetched successfully",
      result,
    );
  });

  updateShipmentStatus = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.id);
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { status, remarks } = req.body;
    const shipment = await shipmentService.updateShipmentStatusService(
      shipmentId,
      status,
      userId,
      role,
      remarks,
    );
    return responseHandler(
      res,
      200,
      "Shipment status updated successfully",
      shipment,
    );
  });

  updateShipment = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.id);
    const customerId = (req as any).user.id;
    const shipment = await shipmentService.updateShipmentService(
      shipmentId,
      customerId,
      req.body,
    );
    return responseHandler(res, 200, "Shipment updated successfully", shipment);
  });

  getMyDeliveries = asyncHandler(async (req: Request, res: Response) => {
    const agentId = (req as any).user.id;

    const shipments = await shipmentService.getMyDeliveriesService(agentId);
    return responseHandler(
      res,
      200,
      "Your deliveries fetched successfully",
      shipments,
    );
  });
}

export default new ShipmentController();
