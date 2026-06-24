"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("shipments", "paymentStatus", {
      type: Sequelize.ENUM("PENDING", "PAID", "FAILED", "REFUNDED"),
      allowNull: true,
      defaultValue: "PENDING",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("shipments", "paymentStatus", {
      type: Sequelize.ENUM("PENDING", "PAID", "FAILED"),
      allowNull: true,
      defaultValue: "PENDING",
    });
  },
};
