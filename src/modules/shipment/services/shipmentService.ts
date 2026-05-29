import { CreateShipmentDto } from "../dto/createShipmentDto";
import shipmentRepository from "../repositories/shipmentRepository";
import generateTrackingId from "../utils/generateTrackingId";
import {
  PAYMENT_STATUS,
  SHIPMENT_STATUS,
} from "../constants/shipmentConstants";
import ApiError from "../../../shared/utils/apiError";
import deliverySlotRepository from "../../deliverySlot/repositories/deliverySlotRepository";
import deliveryAgentRepository from "../../deliveryAgent/repositories/deliveryAgentRepository";
import ShipmentTimeline from "../../shipmentTimeline/models/shipmentTimeLineModel";
import Notification from "../../notifications/models/notificationModel";
import { NOTIFICATION_TYPE } from "../../notifications/constants/notificationConstants";

class ShipmentService {
  // CREATE SHIPMENT
  createShipmentService = async (
    payload: CreateShipmentDto,
    customerId: number,
  ) => {
    const trackingId = generateTrackingId();

    // temporary pricing logic
    const amount = payload.packageWeight * 100;

    const shipmentPayload = {
      ...payload,
      customerId,
      trackingId,
      amount,
      paymentStatus: PAYMENT_STATUS.PENDING,
      shipmentStatus: SHIPMENT_STATUS.PENDING,
    };

    const shipment = await shipmentRepository.createShipment(shipmentPayload);

    // NOTIFY CUSTOMER — SHIPMENT CREATED
    await Notification.create({
      userId: customerId,
      shipmentId: shipment.id,
      title: "Shipment Created",
      message: `Your shipment ${trackingId} has been created successfully`,
      type: NOTIFICATION_TYPE.SHIPMENT_CREATED,
    });

    return shipment;
  };

  // CUSTOMER — GET MY SHIPMENTS
  
  getMyShipmentsService = async (customerId: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await shipmentRepository.findShipmentsByCustomerId(customerId, limit, offset);

    const shipments = rows.map((s: any) => ({
      shipmentId: s.id,
      trackingId: s.trackingId,
      customerId: s.customerId,
      itemName: s.itemName,
      quantity: s.quantity,
      packageWeight: s.packageWeight,
      isFragile: s.isFragile,
      description: s.description,
      senderName: s.senderName ?? null,
      senderPhone: s.senderPhone ?? null,
      pickupAddress: s.pickupAddress,
      pickupCity: s.pickupCity,
      pickupPincode: s.pickupPincode,
      deliveryAddress: s.deliveryAddress,
      deliveryCity: s.deliveryCity,
      deliveryPincode: s.deliveryPincode,
      receiverName: s.receiverName,
      receiverPhone: s.receiverPhone,
      shipmentPriority: s.shipmentPriority,
      shipmentStatus: s.shipmentStatus,
      amount: s.amount,
      paymentStatus: s.paymentStatus,
      assignedSlotStart: s.deliverySlot?.startTime ?? null,
      assignedSlotEnd: s.deliverySlot?.endTime ?? null,
      assignedDate: s.deliverySlot?.date ?? null,
      assignedAgent: s.deliveryAgent
        ? {
            agentId: s.deliveryAgent.id,
            agentName: s.deliveryAgent.user?.name ?? null,
            agentPhone: s.deliveryAgent.phoneNumber ?? null,
            agentEmail: s.deliveryAgent.user?.email ?? null,
            vehicleType: s.deliveryAgent.vehicleType ?? null,
            vehicleNumber: s.deliveryAgent.vehicleNumber ?? null,
            serviceZone: s.deliveryAgent.serviceZone ?? null,
          }
        : null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return {
      shipments,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };

  // GET SHIPMENT BY ID
  getShipmentByIdService = async (
    shipmentId: number,
    userId: number,
    role: string,
  ) => {
    const shipment = await shipmentRepository.findShipmentById(shipmentId);

    if (!shipment) {
      throw new ApiError(404, "Shipment not found");
    }

    // CUSTOMER CAN ONLY VIEW THEIR OWN SHIPMENT
    if (role !== "ADMIN" && shipment.customerId !== userId) {
      throw new ApiError(403, "You are not authorized to access this shipment");
    }

    return shipment;
  };

  // ADMIN — GET ALL SHIPMENTS
  getAllShipmentsService = async () => {
    return await shipmentRepository.findAllShipments();
  };

  // AGENT / ADMIN — UPDATE SHIPMENT STATUS
  updateShipmentStatusService = async (
    shipmentId: number,
    newStatus: string,
    userId: number,
    role: string,
    remarks?: string,
  ) => {
    const shipment = await shipmentRepository.findShipmentById(shipmentId);

    // CHECK SHIPMENT EXISTS
    if (!shipment) {
      throw new ApiError(404, "Shipment not found");
    }

    // DELIVERY AGENT CAN ONLY UPDATE SHIPMENTS ASSIGNED TO THEM
    
    if (role === "DELIVERY_AGENT") {
      const agentProfile =
        await deliveryAgentRepository.findAgentByUserId(userId);
      if (!agentProfile || shipment.deliveryAgentId !== agentProfile.id) {
        throw new ApiError(
          403,
          "You can only update shipments assigned to you",
        );
      }
    }

    // FULL WORKFLOW ORDER
    const workflowOrder = [
      SHIPMENT_STATUS.PENDING,
      SHIPMENT_STATUS.CONFIRMED,
      SHIPMENT_STATUS.ASSIGNED,
      SHIPMENT_STATUS.OUT_FOR_PICKUP,
      SHIPMENT_STATUS.PICKED_UP,
      SHIPMENT_STATUS.IN_TRANSIT,
      SHIPMENT_STATUS.OUT_FOR_DELIVERY,
      SHIPMENT_STATUS.DELIVERED,
      SHIPMENT_STATUS.COMPLETED,
    ];

    // CURRENT STATUS INDEX
    const currentIndex = workflowOrder.indexOf(shipment.shipmentStatus as any);

    // NEW STATUS INDEX
    const newIndex = workflowOrder.indexOf(newStatus as any);

    // INVALID STATUS CHECK
    if (newIndex === -1) {
      throw new ApiError(400, `Invalid status: ${newStatus}`);
    }

    // CANNOT SKIP OR GO BACKWARD
    if (newIndex !== currentIndex + 1) {
      throw new ApiError(
        400,
        `Cannot move from ${shipment.shipmentStatus} to ${newStatus}. Follow the workflow order.`,
      );
    }

    // ONLY ADMIN CAN MARK COMPLETED
    if (newStatus === SHIPMENT_STATUS.COMPLETED && role !== "ADMIN") {
      throw new ApiError(403, "Only admin can mark shipment as COMPLETED");
    }

    // UPDATE SHIPMENT STATUS
    await shipmentRepository.updateShipmentStatus(
      shipmentId,
      newStatus,
      remarks,
    );

    // WRITE TIMELINE ENTRY
    await ShipmentTimeline.create({
      shipmentId,
      updatedByUserId: userId,
      fromStatus: shipment.shipmentStatus,
      toStatus: newStatus,
      remarks,
    });

    // IF DELIVERED  SLOT COMPLETED
    if (newStatus === SHIPMENT_STATUS.DELIVERED && shipment.deliverySlotId) {
      await deliverySlotRepository.updateSlotStatus(
        shipment.deliverySlotId,
        "COMPLETED",
      );
    }

    // IF DELIVERED  DECREASE AGENT ACTIVE LOAD
    if (newStatus === SHIPMENT_STATUS.DELIVERED && shipment.deliveryAgentId) {
      await deliveryAgentRepository.decrementShipmentCount(
        shipment.deliveryAgentId,
      );
    }

    // notification for CUSTOMER — STATUS BASED
    const statusNotificationMap: Record<string, { type: string; title: string; message: string }> = {
      [SHIPMENT_STATUS.IN_TRANSIT]: {
        type: NOTIFICATION_TYPE.SHIPMENT_IN_TRANSIT,
        title: "Shipment In Transit",
        message: `Your shipment ${shipment.trackingId} is now in transit`,
      },
      [SHIPMENT_STATUS.DELAYED]: {
        type: NOTIFICATION_TYPE.SHIPMENT_DELAYED,
        title: "Shipment Delayed",
        message: `Your shipment ${shipment.trackingId} has been delayed`,
      },
      [SHIPMENT_STATUS.DELIVERED]: {
        type: NOTIFICATION_TYPE.SHIPMENT_DELIVERED,
        title: "Shipment Delivered",
        message: `Your shipment ${shipment.trackingId} has been delivered successfully`,
      },
      [SHIPMENT_STATUS.COMPLETED]: {
        type: NOTIFICATION_TYPE.SHIPMENT_COMPLETED,
        title: "Shipment Completed",
        message: `Your shipment ${shipment.trackingId} has been completed`,
      },
    };

    const notifData = statusNotificationMap[newStatus];
    if (notifData) {
      await Notification.create({
        userId: shipment.customerId,
        shipmentId,
        title: notifData.title,
        message: notifData.message,
        type: notifData.type,
      });
    }

    // FETCH UPDATED SHIPMENT WITH AGENT DETAILS
    const updatedShipment =
      await shipmentRepository.findShipmentById(shipmentId);

    //  — returns key status fields + assigned agent info
    return {
      shipmentId: updatedShipment!.id,
      trackingId: updatedShipment!.trackingId,
      paymentStatus: updatedShipment!.paymentStatus,
      shipmentStatus: updatedShipment!.shipmentStatus,
      deliverySlotId: updatedShipment!.deliverySlotId,
      deliveryRemarks: updatedShipment!.deliveryRemarks,
      deliveryAgentId: (updatedShipment as any).deliveryAgent?.id ?? null,
      deliveryAgentName:
        (updatedShipment as any).deliveryAgent?.user?.name ?? null,
      deliveryAgentEmail:
        (updatedShipment as any).deliveryAgent?.user?.email ?? null,
    };
  };

  
  getMyDeliveriesService = async (userId: number) => {
    //  resolve users.id -  delivery_agents.id
    const agentProfile =
      await deliveryAgentRepository.findAgentByUserId(userId);
    if (!agentProfile)
      throw new ApiError(404, "Delivery agent profile not found");

    //  fetch with joins
    const shipments = await shipmentRepository.findShipmentsByAgentId(
      agentProfile.id,
    );

    return shipments.map((s: any) => ({
      shipmentId: s.id,
      trackingId: s.trackingId,
      customerId: s.customerId,
      senderName: s.senderName ?? null,
      senderPhone: s.senderPhone ?? null,
      quantity: s.quantity,
      itemName: s.itemName,
      packageWeight: s.packageWeight,
      isFragile: s.isFragile,
      description: s.description,
      pickupAddress: s.pickupAddress,
      pickupCity: s.pickupCity,
      pickupPincode: s.pickupPincode,
      deliveryAddress: s.deliveryAddress,
      deliveryCity: s.deliveryCity,
      deliveryPincode: s.deliveryPincode,
      receiverName: s.receiverName,
      receiverPhone: s.receiverPhone,
      shipmentPriority: s.shipmentPriority,
      shipmentStatus: s.shipmentStatus,
      amount: s.amount,
      paymentStatus: s.paymentStatus,
      assignedSlotStart: s.deliverySlot?.startTime ?? null,
      assignedSlotEnd: s.deliverySlot?.endTime ?? null,
      assignedDate: s.deliverySlot?.date ?? null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  };
}

export default new ShipmentService();
