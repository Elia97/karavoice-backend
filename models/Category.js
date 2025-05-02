const { DataTypes, Op } = require("sequelize");
const BaseModel = require("./BaseModel");
const { default: slugify } = require("slugify");

class Category extends BaseModel {
  static initialize(sequelize) {
    super.init(
      {
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: {
              msg: "Il nome della categoria non può essere vuoto.",
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
              msg: "La descrizione non può essere vuota."
            }
          }
        },
        slug: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true,
        },
        icon: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "L'icona della categoria non può essere vuoto.",
            },
            len: {
              args: [3, 255],
              msg: "L'icona deve essere tra 3 e 255 caratteri.",
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
      },
      {
        sequelize,
        modelName: "Category",
        tableName: "categories",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            unique: true,
            fields: ["name"],
          },
          {
            unique: true,
            fields: ["slug"],
          },
        ],
      }
    );

    this.addHook("beforeCreate", (category) => {
      category.slug = slugify(category.name, { lower: true, strict: true });
    });

    this.addHook("beforeUpdate", (category) => {
      if (category.changed("name")) {
        category.slug = slugify(category.name, { lower: true, strict: true });
      }
    });
  }

  static associate(models) {
    // Relazione con Event
    this.hasMany(models.Event, {
      foreignKey: "category_id",
      as: "events",
    });
  }
}

module.exports = Category;
