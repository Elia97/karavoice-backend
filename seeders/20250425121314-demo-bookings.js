"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Recuperiamo gli utenti e gli eventi
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users;`
    );
    const [events] = await queryInterface.sequelize.query(
      `SELECT id FROM events;`
    );

    if (users.length === 0) {
      throw new Error(
        "Nessun utente trovato. Esegui prima il seeder per 'users'."
      );
    }

    if (events.length === 0) {
      throw new Error(
        "Nessun evento trovato. Esegui prima il seeder per 'events'."
      );
    }

    // Dati per le prenotazioni
    const bookings = [
      {
        user_id: users[0].id,
        event_id: events[0].id,
        status: "pending",
        participants: 2,
        notes: "Ci piace cantare!",
      },
      {
        user_id: users[1].id,
        event_id: events[1].id,
        status: "pending",
        participants: 2,
        notes: "Pronti per il palco!",
      },
      {
        user_id: users[2].id,
        event_id: events[0].id,
        status: "pending",
        participants: 5,
        notes: "Amici in arrivo!",
      },
      {
        user_id: users[3].id,
        event_id: events[1].id,
        status: "pending",
        participants: 1,
        notes: "Cerco una canzone da condividere con il gruppo!",
      },
    ];

    // Mappiamo i dati per le prenotazioni
    const seedData = bookings.map((booking) => ({
      id: uuidv4(),
      ...booking,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("bookings", seedData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("bookings", null, {});
  },
};
