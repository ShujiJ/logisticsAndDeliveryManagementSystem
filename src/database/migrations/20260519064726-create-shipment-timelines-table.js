"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shipment_timelines", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "shipments",
          key: "id",
        },

        onUpdate: "CASCADE",

        onDelete: "CASCADE",
      },

      updatedByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",

        onDelete: "CASCADE",
      },

      fromStatus: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      toStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("shipment_timelines");
  },
};
