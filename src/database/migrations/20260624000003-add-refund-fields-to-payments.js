"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("payments", "razorpayRefundId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("payments", "refundedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("payments", "razorpayRefundId");
    await queryInterface.removeColumn("payments", "refundedAt");
  },
};
