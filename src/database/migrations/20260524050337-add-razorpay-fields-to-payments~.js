// NEW: Migration to add Razorpay order and payment ID columns to payments table
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // NEW: Add razorpayOrderId column to store Razorpay order ID
    await queryInterface.addColumn("payments", "razorpayOrderId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // NEW: Add razorpayPaymentId column to store Razorpay payment ID from webhook
    await queryInterface.addColumn("payments", "razorpayPaymentId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // NEW: Rollback - remove columns if migration fails
    await queryInterface.removeColumn("payments", "razorpayOrderId");
    await queryInterface.removeColumn("payments", "razorpayPaymentId");
  },
};