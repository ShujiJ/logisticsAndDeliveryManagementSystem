"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "shipments",

      "shipmentStatus",

      {
        type: Sequelize.ENUM(
          "PENDING",
          "ASSIGNED",
          "CONFIRMED",
          "PICKED_UP",
          "IN_TRANSIT",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "DELAYED",
          "CANCELLED",
        ),

        defaultValue: "PENDING",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "shipments",

      "shipmentStatus",

      {
        type: Sequelize.ENUM(
          "PENDING",
          "IN_TRANSIT",
          "DELIVERED",
        ),

        defaultValue: "PENDING",
      },
    );
  },
};
