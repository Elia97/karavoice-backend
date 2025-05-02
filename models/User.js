const { DataTypes } = require("sequelize");
const BaseModel = require("./BaseModel");
const bcrypt = require("bcryptjs");

class User extends BaseModel {
  static initialize(sequelize) {
    super.init(
      {
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "Il nome non può essere vuoto.",
            },
          },
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: {
            msg: "L'email è già in uso.",
          },
          validate: {
            isEmail: {
              msg: "Inserisci un indirizzo email valido.",
            },
            notEmpty: {
              msg: "L'email non può essere vuota.",
            },
          },
        },
        email_verified_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
          validate: {
            isNumeric: {
              msg: "Il numero di telefono deve contenere solo numeri.",
            },
            len: {
              args: [10, 20],
              msg: "Il numero di telefono deve essere lungo tra 10 e 20 caratteri.",
            },
          },
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: true,
          validate: {
            notEmpty: {
              msg: "L'indirizzo non può essere vuoto.",
            },
          },
        },
        city: {
          type: DataTypes.STRING(100),
          allowNull: true,
          validate: {
            notEmpty: {
              msg: "La città non può essere vuota.",
            },
          },
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        avatar: {
          type: DataTypes.STRING(255),
          allowNull: true,
          validate: {
            isUrl: {
              msg: "L'avatar deve essere un URL valido.",
            }
          }
        },
        date_of_birth: {
          type: DataTypes.DATE,
          allowNull: true,
          validate: {
            isDate: {
              msg: "La data di nascita deve essere una data valida.",
            },
            isBefore: {
              args: new Date(),
              msg: "La data di nascita non può essere futura.",
            }
          }
        },
        preferences: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
          validate: {
            isValideJson(value) {
              try {
                JSON.stringify(value);
              } catch (error) {
                throw new Error("Le preferenze devono essere un JSON valido.")
              }
            }
          },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "La password non può essere vuota.",
            },
          },
        },
        role: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: "user",
          validate: {
            isIn: {
              args: [["user", "admin"]],
              msg: "Il ruolo deve essere 'user' o 'admin'.",
            },
          },
        },
        last_login_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            unique: true,
            fields: ["email"], // Indicizzazione per ricerche rapide sull'email
          },
        ],
      }
    );

    // Hook per hash della password prima di creare l'utente
    this.addHook("beforeCreate", async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    });

    // Hook per hash della password prima di aggiornare l'utente
    this.addHook("beforeUpdate", async (user) => {
      if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    });
  }

  static associate(models) {
    this.hasMany(models.Booking, {
      foreignKey: "user_id",
      as: "bookings",
    });
  }

  /**
   * Verifica se la password fornita è valida.
   */
  async isPasswordValid(password) {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Aggiorna il timestamp dell'ultimo login.
   */
  static async updateLastLogin(userId) {
    const user = await this.findByPk(userId);
    if (user) {
      user.last_login_at = new Date();
      await user.save();
    }
  }

  /**
   * Trova un utente per email.
   */
  static async findByEmail(email) {
    return await this.findOne({
      where: {
        email,
      },
    });
  }

  /**
   * Trova tutti gli utenti con un ruolo specifico.
   */
  static async findByRole(role) {
    return await this.findAll({
      where: {
        role,
      },
    });
  }

  /**
   * Trova utenti che non hanno effettuato login da più di `days` giorni.
   */
  static async findInactiveUsers(days) {
    const { Op } = this.sequelize;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await this.findAll({
      where: {
        last_login_at: {
          [Op.lt]: dateThreshold,
        },
      },
    });
  }
}

module.exports = User;
