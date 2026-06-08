"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin@123",
      10,
    );

    await queryInterface.bulkInsert("users", [
      {
        name: process.env.ADMIN_NAME || "Admin1",
        email: process.env.ADMIN_EMAIL || "admin@logistics.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Shuji",
        email: "shuji@logistics.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Shriya",
        email: "shriya@logistics.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Hari",
        email: "hari@logistics.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Ravi",
        email: "ravi@logistics.com",
        password: hashedPassword,
        role: "deliveryAgent",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Pravin",
        email: "pravin@logistics.com",
        password: hashedPassword,
        role: "deliveryAgent",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Shrini",
        email: "shrini@logistics.com",
        password: hashedPassword,
        role: "deliveryAgent",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Get admin id
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = '${process.env.ADMIN_EMAIL || "admin@logistics.com"}' LIMIT 1;`,
    );
    const adminId = admins[0].id;

    // Get agent user ids
    const [agentUsers] = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('ravi@logistics.com', 'pravin@logistics.com', 'shrini@logistics.com') ORDER BY id ASC;`,
    );

    const raviId = agentUsers.find((u) => u.email === "ravi@logistics.com").id;
    const pravinId = agentUsers.find(
      (u) => u.email === "pravin@logistics.com",
    ).id;
    const shriniId = agentUsers.find(
      (u) => u.email === "shrini@logistics.com",
    ).id;

    await queryInterface.bulkInsert("delivery_agents", [
      {
        userId: raviId,
        phoneNumber: "9876543210",
        vehicleType: "BIKE",
        vehicleNumber: "TN32AB1234",
        licenseNumber: "LIC001",
        serviceZone: "Coimbatore",
        availabilityStatus: "AVAILABLE",
        shipmentCount: 0,
        createdByAdminId: adminId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: pravinId,
        phoneNumber: "9876543211",
        vehicleType: "VAN",
        vehicleNumber: "TN32CD5678",
        licenseNumber: "LIC002",
        serviceZone: "Coimbatore",
        availabilityStatus: "AVAILABLE",
        shipmentCount: 0,
        createdByAdminId: adminId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: shriniId,
        phoneNumber: "9876543212",
        vehicleType: "BIKE",
        vehicleNumber: "TN32EF9012",
        licenseNumber: "LIC003",
        serviceZone: "Coimbatore",
        availabilityStatus: "AVAILABLE",
        shipmentCount: 0,
        createdByAdminId: adminId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("delivery_agents", null, {});
    await queryInterface.bulkDelete("users", {
      email: [
        process.env.ADMIN_EMAIL || "admin@logistics.com",
        "shuji@logistics.com",
        "shriya@logistics.com",
        "hari@logistics.com",
        "ravi@logistics.com",
        "pravin@logistics.com",
        "shrini@logistics.com",
      ],
    });
  },
};
