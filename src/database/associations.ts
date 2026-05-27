import User from "../modules/auth/models/userModel";
import DeliveryAgent from "../modules/deliveryAgent/models/deliveryAgentModel";
import Shipment from "../modules/shipment/models/shipmentModel";
import DeliverySlot from "../modules/deliverySlot/models/deliverySlotModel";
import ShipmentTimeline from "../modules/shipmentTimeline/models/shipmentTimeLineModel";
import Payment from "../modules/payment/models/paymentModel";

// USER - DELIVERY AGENT PROFILE
User.hasOne(DeliveryAgent, {
  foreignKey: "userId",

  as: "deliveryAgentProfile",
});

DeliveryAgent.belongsTo(User, {
  foreignKey: "userId",

  as: "user",
});

// ADMIN - CREATED DELIVERY AGENTS
User.hasMany(DeliveryAgent, {
  foreignKey: "createdByAdminId",

  as: "createdDeliveryAgents",
});

DeliveryAgent.belongsTo(User, {
  foreignKey: "createdByAdminId",

  as: "createdByAdmin",
});

// DELIVERY AGENT -SHIPMENTS
//One delivery agent can handle many shipments
DeliveryAgent.hasMany(Shipment, {
  foreignKey: "deliveryAgentId",

  as: "assignedShipments",
});

Shipment.belongsTo(DeliveryAgent, {
  foreignKey: "deliveryAgentId",

  as: "deliveryAgent",
});

//DeliveryAgent to DeliverySlot
DeliveryAgent.hasMany(DeliverySlot, {
  foreignKey: "deliveryAgentId",

  as: "deliverySlots",
});

DeliverySlot.belongsTo(DeliveryAgent, {
  foreignKey: "deliveryAgentId",

  as: "deliveryAgent",
});

//Shipment to DeliverySlot
DeliverySlot.hasMany(Shipment, {
  foreignKey: "deliverySlotId",

  as: "shipments",
});

Shipment.belongsTo(DeliverySlot, {
  foreignKey: "deliverySlotId",

  as: "deliverySlot",
});

//shipment - shipment Timeline
Shipment.hasMany(ShipmentTimeline, {
  foreignKey: "shipmentId",

  as: "timeline",
});

ShipmentTimeline.belongsTo(Shipment, {
  foreignKey: "shipmentId",

  as: "shipment",
});
//User to ShipmentTimeline

User.hasMany(ShipmentTimeline, {
  foreignKey: "updatedByUserId",

  as: "shipmentUpdates",
});

ShipmentTimeline.belongsTo(User, {
  foreignKey: "updatedByUserId",

  as: "updatedBy",
});

//Shipment - payment
Shipment.hasOne(Payment, {
  foreignKey: "shipmentId",

  as: "payment",
});

Payment.belongsTo(Shipment, {
  foreignKey: "shipmentId",

  as: "shipment",
});

//User- payment
User.hasMany(Payment, {
  foreignKey: "customerId",

  as: "payments",
});

Payment.belongsTo(User, {
  foreignKey: "customerId",

  as: "customer",
});

// agents myDeliveries
User.hasMany(Shipment, { foreignKey: "customerId", as: "shipments" });
Shipment.belongsTo(User, { foreignKey: "customerId", as: "customer" });