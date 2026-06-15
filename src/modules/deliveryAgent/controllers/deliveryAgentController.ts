import { Request, Response } from "express";
import asyncHandler from "../../../shared/handlers/asyncHandler";
import responseHandler from "../../../shared/handlers/responseHandler";
import deliveryAgentService from "../services/deliveryAgentService";

class DeliveryAgentController {
  createDeliveryAgent = asyncHandler(async (req: Request, res: Response) => {
    const adminId = (req as any).user.id;
    const deliveryAgent = await deliveryAgentService.createDeliveryAgentService(
      req.body,
      adminId,
    );
    return responseHandler(
      res,
      201,
      "Delivery agent created successfully",
      deliveryAgent,
    );
  });

  getAllDeliveryAgents = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { agents, pagination } = await deliveryAgentService.getAllDeliveryAgentsService(page, limit);
      res.status(200).json({
        success: true,
        message: "Delivery agents fetched successfully",
        data: agents,
        pagination,
      });
    },
  );

  //  Agent toggles their OWN availability from their dashboard
  toggleMyAvailability = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result =
      await deliveryAgentService.toggleMyAvailabilityService(userId);
    return responseHandler(res, 200, result.message, result);
  });

  // Admin toggles a delivery agent's active status
  toggleAgentStatus = asyncHandler(async (req: Request, res: Response) => {
    const agentId = Number(req.params.id);
    const result = await deliveryAgentService.toggleAgentStatusService(agentId);
    const message = result.isActive ? "Delivery agent activated successfully" : "Delivery agent deactivated successfully";
    return responseHandler(res, 200, message, result);
  });

  // Reassign a different agent to a shipment - admin only
  reassignAgent = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const { newAgentId } = req.body;
    const adminUserId = (req as any).user.id;
    const result = await deliveryAgentService.reassignAgentService(
      shipmentId,
      newAgentId,
      adminUserId,
    );
    return responseHandler(res, 200, "Agent reassigned successfully", result);
  });
}

export default new DeliveryAgentController();
