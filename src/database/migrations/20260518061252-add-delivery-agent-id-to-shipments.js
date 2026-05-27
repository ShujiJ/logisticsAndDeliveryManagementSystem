"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("shipments", "deliverySlotId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "delivery_slots",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("shipments", "deliveryRemarks", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("shipments", "deliveryRemarks");
    await queryInterface.removeColumn("shipments", "deliverySlotId");
  },
};
