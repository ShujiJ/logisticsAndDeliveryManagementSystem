"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("shipments", "receiver_email");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("shipments", "receiver_email", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
