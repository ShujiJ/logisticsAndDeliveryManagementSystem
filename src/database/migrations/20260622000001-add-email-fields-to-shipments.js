"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("shipments", "senderEmail", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("shipments", "receiverEmail", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("shipments", "senderEmail");
    await queryInterface.removeColumn("shipments", "receiverEmail");
  },
};
