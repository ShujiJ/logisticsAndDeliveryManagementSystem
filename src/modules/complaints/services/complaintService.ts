import complaintRepository from "../repositories/complaintRepository";
import ApiError from "../../../shared/utils/apiError";
import { COMPLAINT_STATUS_TRANSITIONS } from "../constants/complaintConstants";
import Shipment from "../../shipment/models/shipmentModel";

class ComplaintService {
  raiseComplaintService = async (
    shipmentId: number,
    customerId: number,
    subject: string,
    description: string,
  ) => {
    const shipment = await Shipment.findOne({
      where: { id: shipmentId, customerId },
    });

    if (!shipment) {
      throw new ApiError(
        403,
        "You are not authorized to raise a complaint for this shipment",
      );
    }

    const complaint = await complaintRepository.createComplaint({
      shipmentId,
      customerId,
      subject,
      description,
    });

    return {
      complaintId: complaint.id,
      shipmentId: complaint.shipmentId,
      customerId: complaint.customerId,
      trackingId: shipment.trackingId,
      subject: complaint.subject,
      description: complaint.description,
      status: complaint.status,
      createdAt: complaint.createdAt,
    };
  };

  getAllComplaintsService = async (
    page: number,
    limit: number,
    status?: string,
  ) => {
    const { count, rows } = await complaintRepository.findAllComplaints(
      page,
      limit,
      status,
    );

    const complaints = rows.map((c: any) => ({
      complaintId: c.id,
      shipmentId: c.shipmentId,
      trackingId: c.shipment?.trackingId ?? null,
      subject: c.subject,
      description: c.description,
      status: c.status,
      customer: c.shipment?.customer
        ? {
            customerId: c.shipment.customer.id,
            name: c.shipment.customer.name,
            email: c.shipment.customer.email,
          }
        : null,
      assignedAgent: c.shipment?.deliveryAgent
        ? {
            agentId: c.shipment.deliveryAgent.id,
            name: c.shipment.deliveryAgent.user?.name ?? null,
            email: c.shipment.deliveryAgent.user?.email ?? null,
            phoneNumber: c.shipment.deliveryAgent.phoneNumber,
            vehicleType: c.shipment.deliveryAgent.vehicleType,
            serviceZone: c.shipment.deliveryAgent.serviceZone,
          }
        : null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return {
      complaints,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };
  getMyComplaintsService = async (
    customerId: number,
    page: number,
    limit: number,
  ) => {
    const { count, rows } =
      await complaintRepository.findComplaintsByCustomerId(
        customerId,
        page,
        limit,
      );

    const complaints = rows.map((c: any) => ({
      complaintId: c.id,
      shipmentId: c.shipmentId,
      trackingId: c.shipment?.trackingId ?? null,
      subject: c.subject,
      description: c.description,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return {
      complaints,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };

  updateComplaintStatusService = async (
    complaintId: number,
    newStatus: string,
  ) => {
    const complaint = await complaintRepository.findComplaintById(complaintId);

    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    const currentStatus = complaint.status!;
    const allowedNext = COMPLAINT_STATUS_TRANSITIONS[currentStatus];

    if (allowedNext !== newStatus) {
      throw new ApiError(
        400,
        `Invalid status transition. ${currentStatus} can only move to ${allowedNext}`,
      );
    }

    const previousStatus = currentStatus;
    const updated: any = await complaintRepository.updateComplaintStatus(
      complaintId,
      newStatus,
    );

    return {
      complaintId: updated.id,
      shipmentId: updated.shipmentId,
      trackingId: updated.shipment?.trackingId ?? null,
      subject: updated.subject,
      previousStatus,
      currentStatus: updated.status,
      updatedAt: updated.updatedAt,
    };
  };
}

export default new ComplaintService();
