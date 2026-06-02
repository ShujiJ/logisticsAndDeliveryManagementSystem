"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes("delivery_slots")) return;

    await queryInterface.createTable("delivery_slots", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      deliveryAgentId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "delivery_agents",
          key: "id",
        },

        onUpdate: "CASCADE",

        onDelete: "CASCADE",
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      slotStatus: {
        type: Sequelize.ENUM(
          "AVAILABLE",
          "ASSIGNED",
          "IN_PROGRESS",
          "COMPLETED",
        ),

        allowNull: false,

        defaultValue: "AVAILABLE",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("delivery_slots");
  },
};
