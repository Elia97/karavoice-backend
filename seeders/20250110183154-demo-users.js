"use strict";
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedUserPassword = await bcrypt.hash("userpassword", 10);
    const hashedAdminPassword = await bcrypt.hash("adminpassword", 10);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: uuidv4(),
          name: "User 1",
          email: "user1@example.com",
          password_hashed: hashedUserPassword,
          role: "user",
        },
        {
          id: uuidv4(),
          name: "User 2",
          email: "user2@example.com",
          password_hashed: hashedUserPassword,
          role: "user",
        },
        {
          id: uuidv4(),
          name: "User 3",
          email: "user3@example.com",
          password_hashed: hashedUserPassword,
          role: "user",
        },
        {
          id: uuidv4(),
          name: "User 4",
          email: "user4@example.com",
          password_hashed: hashedUserPassword,
          role: "user",
        },
        {
          id: uuidv4(),
          name: "Admin",
          email: "admin@example.com",
          password_hashed: hashedAdminPassword,
          role: "admin",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
