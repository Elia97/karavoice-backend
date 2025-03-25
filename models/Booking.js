const { DataTypes } = require("sequelize");
const BaseModel = require("./BaseModel");
const Event = require("./Event");
const User = require("./User");
const Location = require("./Location");

class Booking extends BaseModel {
  static initialize(sequelize) {
    super.init(
      {
        user_id: {
          type: DataTypes.UUID, // Utilizza UUID per coerenza con il modello User
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        event_id: {
          type: DataTypes.UUID, // Utilizza UUID per coerenza con il modello Event
          allowNull: false,
          references: {
            model: "events",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: "pending",
          validate: {
            isIn: {
              args: [["pending", "confirmed", "canceled"]],
              msg: "Lo stato deve essere 'pending', 'confirmed' o 'canceled'.",
            },
          },
        },
        participants: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: {
            min: {
              args: [1],
              msg: "Il numero di partecipanti deve essere almeno 1.",
            },
          },
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Booking",
        tableName: "bookings",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "event_id"], // Previene duplicati per lo stesso evento
          },
        ],
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    this.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
  }

  /**
   * Trova tutte le prenotazioni per un determinato utente.
   */
  static async findByUser(userId) {
    return await this.findAllEntries({
      where: { user_id: userId },
      include: [
        {
          model: Event,
          as: "event",
          include: [
            {
              model: Location,
              as: "location",
            },
          ],
        },
      ],
    });
  }

  /**
   * Trova tutte le prenotazioni per un determinato evento.
   */
  static async findByEvent(eventId) {
    return await this.findAllEntries({
      where: { event_id: eventId },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });
  }

  /**
   * Aggiorna lo stato di una prenotazione.
   */
  static async updateStatus(bookingId, status) {
    const validStatuses = ["pending", "confirmed", "canceled"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Lo stato deve essere uno tra: ${validStatuses.join(", ")}.`
      );
    }

    const booking = await this.findByPk(bookingId);
    if (!booking) {
      throw new Error("Prenotazione non trovata.");
    }

    booking.status = status;
    await booking.save();
    return booking;
  }
}

module.exports = Booking;
