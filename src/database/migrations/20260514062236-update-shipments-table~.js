"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("shipments", "customerId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
    await queryInterface.addColumn("shipments", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("shipments", "pickupCity", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });
    await queryInterface.addColumn("shipments", "pickupPincode", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.addColumn("shipments", "deliveryCity", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.addColumn("shipments", "deliveryPincode", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.addColumn("shipments", "isFragile", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn("shipments", "preferredDeliveryFrom", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("shipments", "preferredDeliveryTo", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Rename columns
    await queryInterface.renameColumn(
      "shipments",
      "shipmentType",
      "shipmentPriority",
    );
    await queryInterface.renameColumn("shipments", "status", "shipmentStatus");

    // Remove old columns
    await queryInterface.removeColumn("shipments", "deliveryDate");
    await queryInterface.removeColumn("shipments", "deliverySlotId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("shipments", "deliveryDate", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn("shipments", "deliverySlotId", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    // Rename back

    await queryInterface.renameColumn(
      "shipments",
      "shipmentPriority",
      "shipmentType",
    );

    await queryInterface.renameColumn("shipments", "shipmentStatus", "status");
  
    // Remove added columns
    await queryInterface.removeColumn("shipments", "customerId");
    await queryInterface.removeColumn("shipments", "description");
    await queryInterface.removeColumn("shipments", "pickupCity");
    await queryInterface.removeColumn("shipments", "pickupPincode");
    await queryInterface.removeColumn("shipments", "deliveryCity")
    await queryInterface.removeColumn("shipments", "deliveryPincode");
    await queryInterface.removeColumn("shipments", "isFragile");
    await queryInterface.removeColumn("shipments", "preferredDeliveryFrom");
    await queryInterface.removeColumn("shipments", "preferredDeliveryTo");
  },
};
