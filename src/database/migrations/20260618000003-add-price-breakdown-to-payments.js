"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // price breakdown
    await queryInterface.addColumn("payments", "priceBreakdown", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    // price breakdown
    await queryInterface.removeColumn("payments", "priceBreakdown");
  },
};
