import { Request, Response } from "express";
import asyncHandler from "../../../shared/handlers/asyncHandler";
import responseHandler from "../../../shared/handlers/responseHandler";
import complaintService from "../services/complaintService";

class ComplaintController {
  //create a complaint
  raiseComplaint = asyncHandler(async (req: Request, res: Response) => {
    const shipmentId = Number(req.params.shipmentId);
    const customerId = (req as any).user.id;
    const { subject, description } = req.body;

    const result = await complaintService.raiseComplaintService(
      shipmentId,
      customerId,
      subject,
      description,
    );

    return responseHandler(res, 201, "Complaint raised successfully", result);
  });
  //admin gets all complaint details
  getAllComplaints = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined;

    const result = await complaintService.getAllComplaintsService(
      page,
      limit,
      status,
    );

    return responseHandler(res, 200, "Complaints fetched successfully", result);
  });
}

export default new ComplaintController();
