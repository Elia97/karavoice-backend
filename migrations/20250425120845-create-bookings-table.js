"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabella Bookings
    await queryInterface.createTable("bookings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "events",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "pending",
      },
      participants: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Aggiungi indice unico
    await queryInterface.addIndex("bookings", ["user_id", "event_id"], {
      unique: true,
      where: {
        deletedAt: null, // Applica l'indice solo ai record non eliminati
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("bookings");
  },
};
