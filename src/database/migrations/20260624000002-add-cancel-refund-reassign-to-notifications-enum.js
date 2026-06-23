"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("notifications", "type", {
      type: Sequelize.ENUM(
        "SHIPMENT_CREATED",
        "AGENT_ASSIGNED",
        "SHIPMENT_IN_TRANSIT",
        "SHIPMENT_DELAYED",
        "SHIPMENT_DELIVERED",
        "SHIPMENT_COMPLETED",
        "SHIPMENT_CANCELLED",
        "PAYMENT_UPDATE",
        "PAYMENT_REFUNDED",
        "GENERAL",
        "DELIVERY_OTP",
        "AGENT_REASSIGNED",
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("notifications", "type", {
      type: Sequelize.ENUM(
        "SHIPMENT_CREATED",
        "AGENT_ASSIGNED",
        "SHIPMENT_IN_TRANSIT",
        "SHIPMENT_DELAYED",
        "SHIPMENT_DELIVERED",
        "SHIPMENT_COMPLETED",
        "PAYMENT_UPDATE",
        "GENERAL",
        "DELIVERY_OTP",
      ),
      allowNull: false,
    });
  },
};
