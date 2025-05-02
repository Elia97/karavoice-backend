"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const categories = [
      {
        name: "karaoke",
        slug: "karaoke",
        icon: "mic",
        image: "http://127.0.0.1:3001/uploads/karaoke.webp",
        description: "Scatena la tua voce e conquista il palco! Serate di karaoke aperte a tutti, tra divertimento e atmosfera da star.",
      },
      {
        name: "dj set",
        slug: "dj-set",
        icon: "headphones",
        image: "http://127.0.0.1:3001/uploads/dj-set.webp",
        description: "Beat potenti, luci pulsanti e la migliore selezione musicale: vivi la notte con i DJ più energici della scena.",
      },
      {
        name: "live music",
        slug: "live-music",
        icon: "music",
        image: "http://127.0.0.1:3001/uploads/live-music.webp",
        description: "Performance dal vivo, band emergenti e artisti affermati: scopri il sound autentico che accende ogni serata.",
      },
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
