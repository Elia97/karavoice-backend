const { DataTypes } = require("sequelize");
const BaseModel = require("./BaseModel");
const { Op } = require("sequelize");

class Event extends BaseModel {
  static initialize(sequelize) {
    super.init(
      {
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "Il nome dell'evento non può essere vuoto.",
            },
            len: {
              args: [3, 255],
              msg: "Il nome deve essere tra 3 e 255 caratteri.",
            },
          },
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "La descrizione non può essere vuota.",
            },
          },
        },
        category: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            isIn: {
              args: [["karaoke", "dj set", "live music"]],
              msg: "La categoria deve essere una tra: 'karaoke', 'dj set', 'live music'.",
            },
          },
        },
        image: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            isUrl: {
              msg: "L'immagine deve essere un URL valido.",
            },
          },
        },
        location_id: {
          type: DataTypes.UUID, // Usa UUID per coerenza con il modello Location
          allowNull: false,
          references: {
            model: "locations", // Nome della tabella di riferimento
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        start_time: {
          type: DataTypes.TIME,
          allowNull: true,
          validate: {
            is: {
              args: /^([01]\d|2[0-3]):([0-5]\d)$/, // Modifica la regex per supportare solo HH:MM
              msg: "L'orario di inizio deve essere nel formato HH:MM.",
            },
          },
        },
        end_time: {
          type: DataTypes.TIME,
          allowNull: true,
          validate: {
            is: {
              args: /^([01]\d|2[0-3]):([0-5]\d)$/, // Modifica la regex per supportare solo HH:MM
              msg: "L'orario di fine deve essere nel formato HH:MM.",
            },
          },
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: {
              msg: "La data deve essere valida.",
            },
            isAfter: {
              args: new Date().toISOString().split("T")[0],
              msg: "La data deve essere nel futuro.",
            },
          },
        },
      },
      {
        sequelize,
        modelName: "Event",
        tableName: "events",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            fields: ["name", "date"], // Indicizzazione per ricerca rapida
          },
          {
            fields: ["location_id"], // Indicizzazione per join più veloci
          },
        ],
      }
    );
  }

  static associate(models) {
    // Relazione con Location
    this.belongsTo(models.Location, {
      foreignKey: "location_id",
      as: "location",
    });

    // Relazione con Booking
    this.hasMany(models.Booking, {
      foreignKey: "event_id",
      as: "bookings",
    });
  }

  /**
   * Metodo per trovare eventi futuri
   */
  static async findUpcomingEvents() {
    return await this.findAllEntries({
      where: {
        date: {
          [Op.gte]: new Date().toISOString().split("T")[0],
        },
      },
      order: [["date", "ASC"]],
      include: [{ model: this.sequelize.models.Location, as: "location" }],
    });
  }

  /**
   * Metodo per trovare eventi in una determinata location
   */
  static async findByLocation(locationId) {
    return await this.findAllEntries({
      where: {
        location_id: locationId,
      },
      include: [{ model: this.sequelize.models.Location, as: "location" }],
    });
  }
}

module.exports = Event;
