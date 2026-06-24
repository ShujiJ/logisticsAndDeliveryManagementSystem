import bcrypt from "bcrypt";
import crypto from "crypto";
import { Roles } from "../../auth/constants/roles";
import { CreateShipmentDto } from "../dto/createShipmentDto";
import { UpdateShipmentDto } from "../dto/updateShipmentDto";
import shipmentRepository from "../repositories/shipmentRepository";
import generateTrackingId from "../utils/generateTrackingId";
import {
  PAYMENT_STATUS,
  SHIPMENT_STATUS,
} from "../constants/shipmentConstants";
import ApiError from "../../../shared/utils/apiError";
import { calculateShippingAmount } from "../../../shared/utils/pricingUtil";
import { sendOtpEmail } from "../../../shared/utils/emailUtil";
import deliverySlotRepository from "../../deliverySlot/repositories/deliverySlotRepository";
import deliveryAgentRepository from "../../deliveryAgent/repositories/deliveryAgentRepository";
import ShipmentTimeline from "../../shipmentTimeline/models/shipmentTimeLineModel";
import Notification from "../../notifications/models/notificationModel";
import { NOTIFICATION_TYPE } from "../../notifications/constants/notificationConstants";
import refundService from "../../payment/services/refundService";
import paymentRepository from "../../payment/repositories/paymentRepository";

class ShipmentService {
  // CREATE SHIPMENT
  createShipmentService = async (
    payload: CreateShipmentDto,
    customerId: number,
  ) => {
    const trackingId = generateTrackingId();

    const { breakdown, total } = calculateShippingAmount(
      payload.packageWeight,
      payload.shipmentPriority ?? "STANDARD",
      payload.isFragile ?? false,
    );

    const shipmentPayload = {
      ...payload,
      customerId,
      trackingId,
      amount: total,
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

    const { id, ...rest } = shipment.dataValues;
    // priceBreakdown
    return { shipmentId: id, ...rest, priceBreakdown: breakdown };
  };

  // CUSTOMER — GET MY SHIPMENTS

  getMyShipmentsService = async (
    customerId: number,
    page: number,
    limit: number,
  ) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await shipmentRepository.findShipmentsByCustomerId(
      customerId,
      limit,
      offset,
    );

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
    if (role !== Roles.ADMIN && shipment.customerId !== userId) {
      throw new ApiError(403, "You are not authorized to access this shipment");
    }

    return shipment;
  };

  // ADMIN — GET ALL SHIPMENTS
  getAllShipmentsService = async (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const { count, rows: shipments } =
      await shipmentRepository.findAllShipments(limit, offset);

    const data = shipments.map((s: any) => ({
      shipmentId: s.id,
      trackingId: s.trackingId,
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
      customer: s.customer
        ? {
            customerId: s.customer.id,
            name: s.customer.name,
            email: s.customer.email,
            phoneNumber: s.customer.phoneNumber ?? null,
          }
        : null,
      assignedAgent: s.deliveryAgent
        ? {
            agentId: s.deliveryAgent.id,
            name: s.deliveryAgent.user?.name ?? null,
            email: s.deliveryAgent.user?.email ?? null,
            phoneNumber: s.deliveryAgent.user?.phoneNumber ?? null,
            vehicleType: s.deliveryAgent.vehicleType ?? null,
            vehicleNumber: s.deliveryAgent.vehicleNumber ?? null,
            serviceZone: s.deliveryAgent.serviceZone ?? null,
          }
        : null,
      assignedSlotStart: s.deliverySlot?.startTime ?? null,
      assignedSlotEnd: s.deliverySlot?.endTime ?? null,
      assignedDate: s.deliverySlot?.date ?? null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return {
      shipments: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };

  // CUSTOMER — UPDATE SHIPMENT (only while both statuses are PENDING)
  updateShipmentService = async (
    shipmentId: number,
    customerId: number,
    payload: UpdateShipmentDto,
  ) => {
    const shipment = await shipmentRepository.findShipmentById(shipmentId);

    if (!shipment) {
      throw new ApiError(404, "Shipment not found");
    }

    if (shipment.customerId !== customerId) {
      throw new ApiError(403, "You are not authorized to update this shipment");
    }

    if (
      shipment.shipmentStatus !== SHIPMENT_STATUS.PENDING ||
      shipment.paymentStatus !== PAYMENT_STATUS.PENDING
    ) {
      throw new ApiError(
        400,
        "Shipment can only be updated when both shipment status and payment status are PENDING",
      );
    }

    const pricingTouched =
      "packageWeight" in payload ||
      "shipmentPriority" in payload ||
      "isFragile" in payload;

    let updatedAmount: number | undefined;
    let breakdown: any;

    if (pricingTouched) {
      const result = calculateShippingAmount(
        payload.packageWeight ?? shipment.packageWeight,
        (payload.shipmentPriority ?? shipment.shipmentPriority ?? "STANDARD") as "STANDARD" | "EXPRESS" | "SAME_DAY",
        payload.isFragile ?? shipment.isFragile ?? false,
      );
      updatedAmount = result.total;
      breakdown = result.breakdown;
    }

    const updatePayload = {
      ...payload,
      ...(updatedAmount !== undefined ? { amount: updatedAmount } : {}),
    };

    await shipmentRepository.updateShipment(shipmentId, updatePayload);

    const updated = await shipmentRepository.findShipmentById(shipmentId);

    const { id, ...rest } = (updated as any).dataValues;
    return {
      shipmentId: id,
      ...rest,
      ...(breakdown ? { priceBreakdown: breakdown } : {}),
    };
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

    if (role === Roles.DELIVERY_AGENT) {
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
    if (newStatus === SHIPMENT_STATUS.COMPLETED && role !== Roles.ADMIN) {
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
    const statusNotificationMap: Record<
      string,
      { type: string; title: string; message: string }
    > = {
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

  // AGENT / ADMIN — SEND DELIVERY OTP TO CUSTOMER
  sendOtpService = async (shipmentId: number, userId: number, role: string) => {
    const shipment = await shipmentRepository.findShipmentById(shipmentId);

    if (!shipment) throw new ApiError(404, "Shipment not found");

    if (role === Roles.DELIVERY_AGENT) {
      const agentProfile =
        await deliveryAgentRepository.findAgentByUserId(userId);
      if (!agentProfile || shipment.deliveryAgentId !== agentProfile.id) {
        throw new ApiError(
          403,
          "You can only send OTP for shipments assigned to you",
        );
      }
    }

    if (shipment.shipmentStatus !== SHIPMENT_STATUS.OUT_FOR_DELIVERY) {
      throw new ApiError(
        400,
        "OTP can only be sent when shipment is OUT_FOR_DELIVERY",
      );
    }

    const otp = crypto.randomInt(1000, 10000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await shipmentRepository.saveOtp(shipmentId, hashedOtp, otpExpiresAt);

    await Notification.create({
      userId: shipment.customerId,
      shipmentId,
      title: "Delivery OTP Sent",
      message: `An OTP has been generated for delivery of shipment ${shipment.trackingId}. It has been sent to the receiver.`,
      type: NOTIFICATION_TYPE.DELIVERY_OTP,
    });

    if (shipment.receiverEmail) {
      await sendOtpEmail(shipment.receiverEmail, otp, shipment.trackingId);
    }

    return { shipmentId, otpExpiresAt };
  };

  // AGENT — VERIFY DELIVERY OTP AND MARK DELIVERED
  verifyOtpService = async (
    shipmentId: number,
    otp: string,
    userId: number,
  ) => {
    const shipment = await shipmentRepository.findShipmentById(shipmentId);

    if (!shipment) throw new ApiError(404, "Shipment not found");

    const agentProfile =
      await deliveryAgentRepository.findAgentByUserId(userId);
    if (!agentProfile || shipment.deliveryAgentId !== agentProfile.id) {
      throw new ApiError(
        403,
        "You can only verify OTP for shipments assigned to you",
      );
    }

    if (!shipment.deliveryOtp || !shipment.otpExpiresAt) {
      throw new ApiError(400, "No OTP found. Please request a new OTP first.");
    }

    if (shipment.otpUsed) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    if (new Date() > new Date(shipment.otpExpiresAt)) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    const isValid = await bcrypt.compare(otp, shipment.deliveryOtp);
    if (!isValid) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    const deliveredAt = new Date();

    await shipmentRepository.markDelivered(shipmentId, deliveredAt);

    await ShipmentTimeline.create({
      shipmentId,
      updatedByUserId: userId,
      fromStatus: SHIPMENT_STATUS.OUT_FOR_DELIVERY,
      toStatus: SHIPMENT_STATUS.DELIVERED,
      remarks: "Delivery verified via OTP",
    });

    if (shipment.deliverySlotId) {
      await deliverySlotRepository.updateSlotStatus(
        shipment.deliverySlotId,
        "COMPLETED",
      );
    }

    if (shipment.deliveryAgentId) {
      await deliveryAgentRepository.decrementShipmentCount(
        shipment.deliveryAgentId,
      );
    }

    await Notification.create({
      userId: shipment.customerId,
      shipmentId,
      title: "Shipment Delivered",
      message: `Your shipment ${shipment.trackingId} has been delivered successfully`,
      type: NOTIFICATION_TYPE.SHIPMENT_DELIVERED,
    });

    return {
      shipmentId,
      shipmentStatus: SHIPMENT_STATUS.DELIVERED,
      deliveredAt,
    };
  };

  cancelShipmentService = async (shipmentId: number, customerId: number) => {
    const shipment = await shipmentRepository.findShipmentById(shipmentId);
    if (!shipment) throw new ApiError(404, "Shipment not found");

    if (shipment.customerId !== customerId) {
      throw new ApiError(403, "You can only cancel your own shipments");
    }

    const nonCancellableStatuses = [
      SHIPMENT_STATUS.PICKED_UP,
      SHIPMENT_STATUS.IN_TRANSIT,
      SHIPMENT_STATUS.OUT_FOR_DELIVERY,
      SHIPMENT_STATUS.DELIVERED,
      SHIPMENT_STATUS.COMPLETED,
      SHIPMENT_STATUS.CANCELLED,
    ];

    if (nonCancellableStatuses.includes(shipment.shipmentStatus as any)) {
      throw new ApiError(
        400,
        `Shipment cannot be cancelled once it is ${shipment.shipmentStatus}`,
      );
    }

    if (shipment.deliverySlotId) {
      await deliverySlotRepository.updateSlotStatus(
        shipment.deliverySlotId,
        "MISSED",
      );
    }

    if (shipment.deliveryAgentId) {
      await deliveryAgentRepository.decrementShipmentCount(
        shipment.deliveryAgentId,
      );
    }

    // refund — if customer already paid, trigger Razorpay refund
    await refundService.refundPaymentService(shipmentId);

    await shipmentRepository.updateShipmentStatus(
      shipmentId,
      SHIPMENT_STATUS.CANCELLED,
      "Cancelled by customer",
    );

    await ShipmentTimeline.create({
      shipmentId,
      updatedByUserId: customerId,
      fromStatus: shipment.shipmentStatus,
      toStatus: SHIPMENT_STATUS.CANCELLED,
      remarks: "Cancelled by customer",
    });

    await Notification.create({
      userId: customerId,
      shipmentId,
      title: "Shipment Cancelled",
      message: `Your shipment ${shipment.trackingId} has been cancelled`,
      type: NOTIFICATION_TYPE.SHIPMENT_CANCELLED,
    });

    const updatedPayment = await paymentRepository.findPaymentByShipmentId(shipmentId);

    return {
      shipmentId,
      trackingId: shipment.trackingId,
      shipmentStatus: SHIPMENT_STATUS.CANCELLED,
      paymentStatus: updatedPayment?.paymentStatus ?? shipment.paymentStatus,
    };
  };

  getMyDeliveriesService = async (
    userId: number,
    page: number,
    limit: number,
  ) => {
    //  resolve users.id -  delivery_agents.id
    const agentProfile =
      await deliveryAgentRepository.findAgentByUserId(userId);
    if (!agentProfile)
      throw new ApiError(404, "Delivery agent profile not found");

    //  fetch with joins
    const { shipments, total } =
      await shipmentRepository.findShipmentsByAgentId(
        agentProfile.id,
        page,
        limit,
      );

    return {
      shipments: shipments.map((s: any) => ({
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
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };
}

export default new ShipmentService();
