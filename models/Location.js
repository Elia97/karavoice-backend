const { DataTypes } = require("sequelize");
const BaseModel = require("./BaseModel");

class Location extends BaseModel {
  static initialize(sequelize) {
    super.init(
      {
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "Il nome della location non può essere vuoto.",
            },
          },
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "L'indirizzo non può essere vuoto.",
            },
          },
        },
        city: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "La città non può essere vuota.",
            },
          },
        },
        province: {
          type: DataTypes.STRING(100),
          allowNull: true, // Facoltativo
        },
        zip_code: {
          type: DataTypes.STRING(10),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "Il CAP non può essere vuoto.",
            },
            isNumeric: {
              msg: "Il CAP deve contenere solo numeri.",
            },
            len: {
              args: [4, 10], // Valori tipici per CAP internazionali
              msg: "Il CAP deve essere lungo tra 4 e 10 caratteri.",
            },
          },
        },
        country: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: "Italia", // Puoi modificare il valore predefinito se necessario
          validate: {
            notEmpty: {
              msg: "Il paese non può essere vuoto.",
            },
          },
        },
        latitude: {
          type: DataTypes.DECIMAL(9, 6),
          allowNull: false,
          validate: {
            isDecimal: {
              msg: "La latitudine deve essere un numero decimale valido.",
            },
          },
        },
        longitude: {
          type: DataTypes.DECIMAL(9, 6),
          allowNull: false,
          validate: {
            isDecimal: {
              msg: "La longitudine deve essere un numero decimale valido.",
            },
          },
        },
      },
      {
        sequelize,
        modelName: "Location",
        tableName: "locations",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            fields: ["city", "province", "postal_code"], // Indicizzazione geografica
          },
          {
            fields: ["latitude", "longitude"], // Indicizzazione per calcoli geospaziali
          },
        ],
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Event, {
      foreignKey: "location_id",
      as: "events",
    });
  }

  /**
   * Metodo personalizzato per verificare se un indirizzo è già registrato.
   */
  static async isDuplicateAddress(address) {
    const location = await this.findOne({ where: { address } });
    return !!location;
  }

  /**
   * Metodo per ottenere la location più vicina a una coppia di coordinate.
   */
  static async findClosest(latitude, longitude) {
    return await this.findOne({
      order: [
        [
          sequelize.literal(
            `ST_Distance_Sphere(point(longitude, latitude), point(${longitude}, ${latitude}))`
          ),
          "ASC",
        ],
      ],
    });
  }

  /**
   * Metodo per trovare location in una città specifica.
   */
  static async findByCity(city) {
    return await this.findAll({
      where: {
        city,
      },
    });
  }

  /**
   * Metodo per cercare location vicine a una coppia di coordinate.
   * Include calcoli di prossimità basati su latitudine e longitudine.
   */
  static async findNearby(latitude, longitude, radius = 10) {
    const { fn, col, Op } = this.sequelize;
    return await this.findAll({
      where: {
        [Op.and]: [
          fn(
            "ST_Distance_Sphere",
            fn("POINT", col("longitude"), col("latitude")),
            fn("POINT", longitude, latitude)
          ),
          {
            [Op.lte]: radius * 1000, // Raggio in metri
          },
        ],
      },
    });
  }
}

module.exports = Location;
