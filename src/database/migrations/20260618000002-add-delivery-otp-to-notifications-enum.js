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
        "PAYMENT_UPDATE",
        "GENERAL",
        "DELIVERY_OTP",
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
      ),
      allowNull: false,
    });
  },
};
