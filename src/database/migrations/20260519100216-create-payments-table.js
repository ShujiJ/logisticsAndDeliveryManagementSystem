"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,

        references: {
          model: "shipments",
          key: "id",
        },

        onUpdate: "CASCADE",

        onDelete: "CASCADE",
      },

      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",

        onDelete: "CASCADE",
      },

      transactionId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      paymentStatus: {
        type: Sequelize.ENUM("PENDING", "PAID", "FAILED"),

        allowNull: false,

        defaultValue: "PENDING",
      },

      paidAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable("payments");
  },
};
