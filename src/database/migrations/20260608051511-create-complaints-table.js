"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("complaints", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "shipments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      subject: {
        type: Sequelize.ENUM(
          "PACKAGE_NOT_DELIVERED",
          "DAMAGED_PACKAGE",
          "WRONG_ITEM_DELIVERED",
          "DELIVERY_DELAYED",
          "AGENT_BEHAVIOUR",
          "PARTIAL_DELIVERY",
          "LOST_PACKAGE",
          "PAYMENT_ISSUE",
          "OTHER",
        ),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("OPEN", "IN_REVIEW", "RESOLVED"),
        allowNull: false,
        defaultValue: "OPEN",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("complaints");
  },
};
