"use strict";
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: uuidv4(),
          name: "User Normal",
          email: "user@example.com",
          password_hashed: await bcrypt.hash("password123", 10),
          role: "user",
        },
        {
          id: uuidv4(),
          name: "Admin User",
          email: "admin@example.com",
          password_hashed: await bcrypt.hash("adminpassword", 10),
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
