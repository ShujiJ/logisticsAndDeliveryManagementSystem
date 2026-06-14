"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("delivery_slots", "slotStatus", {
      type: Sequelize.ENUM("AVAILABLE", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "MISSED"),
      allowNull: false,
      defaultValue: "AVAILABLE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("delivery_slots", "slotStatus", {
      type: Sequelize.ENUM("AVAILABLE", "ASSIGNED", "IN_PROGRESS", "COMPLETED"),
      allowNull: false,
      defaultValue: "AVAILABLE",
    });
  },
};
