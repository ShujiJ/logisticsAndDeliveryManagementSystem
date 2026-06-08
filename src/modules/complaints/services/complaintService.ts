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
}

export default new ComplaintService();
