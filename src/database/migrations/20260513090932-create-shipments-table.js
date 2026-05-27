"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shipments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      trackingId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      itemName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      packageWeight: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      pickupAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      deliveryAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      senderName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      senderPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      receiverName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      receiverPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      deliveryDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      deliverySlotId: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      shipmentType: {
        type: Sequelize.ENUM("STANDARD", "EXPRESS", "SAME_DAY"),
        defaultValue: "STANDARD",
      },

      paymentStatus: {
        type: Sequelize.ENUM("PENDING", "PAID", "FAILED"),
        defaultValue: "PENDING",
      },

      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "CONFIRMED",
          "PICKED_UP",
          "IN_TRANSIT",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "CANCELLED",
        ),
        defaultValue: "PENDING",
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
    await queryInterface.dropTable("shipments");
  },
};
