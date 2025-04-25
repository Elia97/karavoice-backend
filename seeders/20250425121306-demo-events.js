"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Recuperiamo tutte le location e categorie per associarle dinamicamente
    const [locations] = await queryInterface.sequelize.query(
      `SELECT id, name FROM locations;`
    );
    const [categories] = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories;`
    );

    if (locations.length === 0) {
      throw new Error(
        "Nessuna location disponibile. Esegui prima il seeder per 'locations'."
      );
    }

    if (categories.length === 0) {
      throw new Error(
        "Nessuna categoria disponibile. Esegui prima il seeder per 'categories'."
      );
    }

    const events = [
      {
        name: "Karaoke Night 🎤",
        description:
          "Una serata all'insegna della musica e del divertimento. Microfoni aperti a tutti!",
        category_id: categories.find((cat) => cat.name === "karaoke").id, // Usa category_id
        featured: false,
        image: "http://127.0.0.1:3001/uploads/karaoke.webp",
        date: "2025-05-01",
        start_time: "21:00:00",
        end_time: "23:30:00",
      },
      {
        name: "Retro 80s Party",
        description:
          "Canta i più grandi successi degli anni '80 con il nostro DJ resident.",
        category_id: categories.find((cat) => cat.name === "dj set").id, // Usa category_id
        featured: false,
        image: "http://127.0.0.1:3001/uploads/dj-set.webp",
        date: "2025-05-10",
        start_time: "20:30:00",
        end_time: "00:00:00",
      },
      {
        name: "Trap & Karaoke Mix",
        description:
          "Un mix inedito tra trap e karaoke, per veri performer urbani.",
        category_id: categories.find((cat) => cat.name === "live music").id, // Usa category_id
        featured: false,
        image: "http://127.0.0.1:3001/uploads/live-music.webp",
        date: "2025-06-15",
        start_time: "22:00:00",
        end_time: "01:00:00",
      },
      {
        name: "Sing Like a Star 🌟",
        description:
          "Sfida i tuoi amici a colpi di note: chi sarà il vero protagonista del palco?",
        category_id: categories.find((cat) => cat.name === "karaoke").id, // Usa category_id
        featured: true,
        image: "http://127.0.0.1:3001/uploads/karaoke.webp",
        date: "2025-06-01",
        start_time: "20:00:00",
        end_time: "23:00:00",
      },
      {
        name: "Electronic Vibes by Night",
        description:
          "Un DJ set immersivo tra beat elettronici e visual futuristici. Solo per anime notturne.",
        category_id: categories.find((cat) => cat.name === "dj set").id, // Usa category_id
        featured: true,
        image: "http://127.0.0.1:3001/uploads/dj-set.webp",
        date: "2025-06-08",
        start_time: "22:30:00",
        end_time: "02:30:00",
      },
      {
        name: "Live Jam Session 🎸",
        description:
          "Musicisti dal vivo, improvvisazioni mozzafiato e un pubblico che fa vibrare le corde.",
        category_id: categories.find((cat) => cat.name === "live music").id, // Usa category_id
        featured: true,
        image: "http://127.0.0.1:3001/uploads/live-music.webp",
        date: "2025-07-03",
        start_time: "21:00:00",
        end_time: "00:00:00",
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
