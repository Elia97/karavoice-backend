"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Recuperiamo tutte le location per associarle dinamicamente
    const [locations] = await queryInterface.sequelize.query(
      `SELECT id, name FROM locations;`
    );

    if (locations.length === 0) {
      throw new Error(
        "Nessuna location disponibile. Esegui prima il seeder per 'locations'."
      );
    }

    const events = [
      {
        name: "Karaoke Night 🎤",
        description:
          "Una serata all'insegna della musica e del divertimento. Microfoni aperti a tutti!",
        category: "karaoke",
        image: "http://127.0.0.1:3001/uploads/karaoke.webp",
        date: "2025-05-01",
        start_time: "21:00:00",
        end_time: "23:30:00",
      },
      {
        name: "Retro 80s Party",
        description:
          "Canta i più grandi successi degli anni '80 con il nostro DJ resident.",
        category: "dj set",
        image: "http://127.0.0.1:3001/uploads/dj-set.webp",
        date: "2025-05-10",
        start_time: "20:30:00",
        end_time: "00:00:00",
      },
      {
        name: "Trap & Karaoke Mix",
        description:
          "Un mix inedito tra trap e karaoke, per veri performer urbani.",
        category: "live music",
        image: "http://127.0.0.1:3001/uploads/live-music.webp",
        date: "2025-06-15",
        start_time: "22:00:00",
        end_time: "01:00:00",
      },
    ];

    // Mappiamo gli eventi associando location a rotazione
    const seedData = events.map((event, index) => ({
      id: uuidv4(),
      ...event,
      location_id: locations[index % locations.length].id,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("events", seedData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("events", null, {});
  },
};
