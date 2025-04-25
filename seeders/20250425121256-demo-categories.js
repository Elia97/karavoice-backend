"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const categories = [
      { name: "karaoke", slug: "karaoke", icon: "mic" },
      { name: "dj set", slug: "dj-set", icon: "headphones" },
      { name: "live music", slug: "live-music", icon: "music" },
    ];

    const seedData = categories.map((category) => ({
      id: Sequelize.literal("uuid_generate_v4()"),
      ...category,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("categories", seedData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
