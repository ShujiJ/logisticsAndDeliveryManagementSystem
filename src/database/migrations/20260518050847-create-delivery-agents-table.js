"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("delivery_agents", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      vehicleType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      vehicleNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      licenseNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      serviceZone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      availabilityStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "AVAILABLE",
      },

      shipmentCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      createdByAdminId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "users",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("delivery_agents");
  },
};
