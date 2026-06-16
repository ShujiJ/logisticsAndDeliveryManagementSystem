import { Request, Response } from "express";
import asyncHandler from "../../../shared/handlers/asyncHandler";
import responseHandler from "../../../shared/handlers/responseHandler";
import chatService from "../services/chatService";

class ChatController {
  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const senderId = (req as any).user.id;
    const senderRole = (req as any).user.role;
    const { message } = req.body;

    const result = await chatService.sendMessageService(
      shipmentId,
      senderId,
      senderRole,
      message,
    );

    return responseHandler(res, 201, "Message sent successfully", result);
  });

  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await chatService.getMessagesService(
      shipmentId,
      userId,
      userRole,
      page,
      limit,
    );

    return responseHandler(res, 200, "Chat fetched successfully", result);
  });

  getChatHistory = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await chatService.getChatHistoryService(
      shipmentId,
      page,
      limit,
    );

    return responseHandler(res, 200, "Chat history fetched successfully", result);
  });
}

export default new ChatController();
