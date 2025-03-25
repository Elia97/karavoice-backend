const fs = require("fs");
const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require("../config/database");
const basename = path.basename(__filename);
const db = {};

// Carica i modelli
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      !file.includes(".test.js")
  )
  .forEach((file) => {
    const modelPath = path.join(__dirname, file);
    const modelInit = require(modelPath);
    db[modelInit.name] = modelInit;
  });

// Associa i modelli
Object.keys(db).forEach((modelName) => {
  if (db[modelName].initialize) {
    db[modelName].initialize(sequelize); // Inizializza ogni modello
  }
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // Fai le associazioni dopo l'inizializzazione
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
