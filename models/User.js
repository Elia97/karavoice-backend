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
        password_hashed: {
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
      if (user.password_hashed) {
        user.password_hashed = await bcrypt.hash(user.password_hashed, 10);
      }
    });

    // Hook per hash della password prima di aggiornare l'utente
    this.addHook("beforeUpdate", async (user) => {
      if (user.changed("password_hashed")) {
        user.password_hashed = await bcrypt.hash(user.password_hashed, 10);
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
    return bcrypt.compare(password, this.password_hashed);
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
