"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "locations",
      [
        {
          id: uuidv4(),
          name: "Voice Club Milano",
          address: "Via della Musica 12",
          city: "Milano",
          province: "MI",
          zip_code: "20100",
          country: "Italia",
          latitude: 45.4642,
          longitude: 9.19,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          name: "Karaoke Palace Roma",
          address: "Piazza del Canto 5",
          city: "Roma",
          province: "RM",
          zip_code: "00100",
          country: "Italia",
          latitude: 41.9028,
          longitude: 12.4964,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("locations", null, {});
  },
};
