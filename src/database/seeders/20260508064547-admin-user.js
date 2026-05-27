"use strict";
const bcrypt = require("bcryptjs");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await queryInterface.bulkInsert("users", [
      {
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Delivery Agent",
        email: "agent@logistics.com",
        password: hashedPassword,
        role: "deliveryAgent",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: process.env.ADMIN_EMAIL,
    });
  },
};
