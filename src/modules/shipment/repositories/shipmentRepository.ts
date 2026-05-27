import Shipment from "../models/shipmentModel";
import DeliveryAgent from "../../deliveryAgent/models/deliveryAgentModel";
import User from "../../auth/models/userModel";
import DeliverySlot from "../../deliverySlot/models/deliverySlotModel";
class ShipmentRepository {
  async createShipment(payload: any) {
    return await Shipment.create(payload);
  }

  // added joins (DeliveryAgent, User, DeliverySlot) + findAndCountAll for pagination
  async findShipmentsByCustomerId(customerId: number, limit: number, offset: number) {
    return await Shipment.findAndCountAll({
      where: { customerId },
      include: [
        {
          model: DeliveryAgent,
          as: "deliveryAgent",
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: DeliverySlot,
          as: "deliverySlot",
          required: false,
          attributes: ["date", "startTime", "endTime"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

 
  async findShipmentById(shipmentId: number) {
    return await Shipment.findByPk(shipmentId, {
      include: [
        {
          model: DeliveryAgent,
          as: "deliveryAgent",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });
  }

  async findAllShipments() {
    return await Shipment.findAll({
      order: [["createdAt", "DESC"]],
    });
  }

  // agent finds their own shipments
  async findShipmentsByAgentId(deliveryAgentId: number) {
    return await Shipment.findAll({
      where: { deliveryAgentId },
      include: [
        // {
        //   model: User,
        //   as: "customer",
        //   attributes: ["id", "name", "phoneNumber"],
        // },
        {
          model: DeliverySlot,
          as: "deliverySlot",
          attributes: ["date", "startTime", "endTime"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  // existing — used by auto-assign
  assignDeliveryAgentRepository = async (
    shipmentId: number,
    deliveryAgentId: number,
    deliverySlotId: number,
  ) => {
    return await Shipment.update(
      {
        deliveryAgentId,
        deliverySlotId,
        shipmentStatus: "ASSIGNED",
      },
      { where: { id: shipmentId } },
    );
  };

  async updateShipmentStatus(
    shipmentId: number,
    shipmentStatus: string,
    deliveryRemarks?: string,
  ) {
    return await Shipment.update(
      {
        shipmentStatus,
        ...(deliveryRemarks ? { deliveryRemarks } : {}),
      },
      { where: { id: shipmentId } },
    );
  }

  //  used by payment confirmation to mark shipment CONFIRMED
  async updatePaymentAndStatus(
    shipmentId: number,
    paymentStatus: string,
    shipmentStatus: string,
  ) {
    return await Shipment.update(
      { paymentStatus, shipmentStatus },
      { where: { id: shipmentId } },
    );
  }
}

export default new ShipmentRepository();
