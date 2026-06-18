"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("shipments", "deliveryOtp", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("shipments", "otpExpiresAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("shipments", "otpUsed", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("shipments", "deliveredAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("shipments", "deliveryOtp");
    await queryInterface.removeColumn("shipments", "otpExpiresAt");
    await queryInterface.removeColumn("shipments", "otpUsed");
    await queryInterface.removeColumn("shipments", "deliveredAt");
  },
};
