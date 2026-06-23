"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("payments", "paymentStatus", {
      type: Sequelize.ENUM("PENDING", "PAID", "FAILED", "REFUNDED"),
      allowNull: false,
      defaultValue: "PENDING",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("payments", "paymentStatus", {
      type: Sequelize.ENUM("PENDING", "PAID", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    });
  },
};
