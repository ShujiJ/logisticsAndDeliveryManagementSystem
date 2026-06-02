"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("shipments", "deliveryAgentId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "delivery_agents",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("shipments", "deliveryAgentId");
  },
};
