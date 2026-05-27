import DeliverySlot from "../models/deliverySlotModel";

class DeliverySlotRepository {
  createDeliverySlot = async (
    data: any,
  ) => {
    return await DeliverySlot.create(data);
  };

  findDeliverySlotById = async (
    deliverySlotId: number,
  ) => {
    return await DeliverySlot.findByPk(
      deliverySlotId,
    );
  };

  updateSlotStatus = async (
    deliverySlotId: number,
    slotStatus: string,
  ) => {
    return await DeliverySlot.update(
      {
        slotStatus,
      },
      {
        where: {
          id: deliverySlotId,
        },
      },
    );
  };
}

export default new DeliverySlotRepository();