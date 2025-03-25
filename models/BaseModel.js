const { Model, DataTypes } = require("sequelize");

class BaseModel extends Model {
  static initialize(sequelize) {
    this.init(
      {
        id: {
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      },
      {
        sequelize,
        modelName: this.name,
        timestamps: true,
        paranoid: true,
        defaultScope: {
          where: {
            deletedAt: null,
          },
        },
        scopes: {
          withDeleted: {
            where: {},
          },
        },
      }
    );
  }

  /**
   * Metodo per creare un nuovo record con validazione e fallback.
   */
  static async createEntry(data) {
    try {
      return await this.create(data);
    } catch (error) {
      console.error(`[BaseModel] Error during create: ${error.message}`);
      throw error; // Rilancia l'errore per una gestione a livello superiore
    }
  }

  /**
   * Metodo per trovare tutti i record.
   */
  static async findAllEntries(options = {}) {
    try {
      return await this.findAll(options);
    } catch (error) {
      console.error(`[BaseModel] Error during findAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * Metodo per trovare un record specifico tramite ID.
   */
  static async findEntryById(id, options = {}) {
    try {
      return await this.findByPk(id, options);
    } catch (error) {
      console.error(`[BaseModel] Error during findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * Metodo per aggiornare un record tramite ID.
   */
  static async updateEntry(id, data) {
    try {
      const record = await this.findByPk(id);
      if (record) {
        return await record.update(data);
      }
      return null;
    } catch (error) {
      console.error(`[BaseModel] Error during updateEntry: ${error.message}`);
      throw error;
    }
  }

  /**
   * Metodo per eliminare (logicamente) un record tramite ID.
   */
  static async deleteEntry(id) {
    try {
      const record = await this.findByPk(id);
      if (record) {
        await record.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[BaseModel] Error during deleteEntry: ${error.message}`);
      throw error;
    }
  }

  /**
   * Metodo per ripristinare un record eliminato logicamente.
   */
  static async restoreEntry(id) {
    try {
      const record = await this.scope("withDeleted").findByPk(id);
      if (record) {
        await record.restore();
        return record;
      }
      return null;
    } catch (error) {
      console.error(`[BaseModel] Error during restoreEntry: ${error.message}`);
      throw error;
    }
  }

  /**
   * Metodo per eliminare definitivamente un record tramite ID.
   */
  static async permanentlyDeleteEntry(id) {
    try {
      const record = await this.scope("withDeleted").findByPk(id);
      if (record) {
        await record.destroy({ force: true }); // Hard delete
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `[BaseModel] Error during permanentlyDeleteEntry: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Metodo per eseguire query personalizzate con una gestione sicura delle transazioni.
   */
  static async executeInTransaction(transactionCallback) {
    const sequelize = this.sequelize;
    const transaction = await sequelize.transaction();
    try {
      const result = await transactionCallback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      console.error(`[BaseModel] Transaction failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BaseModel;
