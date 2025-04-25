const db = require("../models");

beforeAll(async () => {
  // Verifica che Sequelize si stia connettendo al database correttamente
  try {
    await db.sequelize.authenticate(); // Verifica la connessione
    console.log("Connection has been established successfully.");

    // Pulizia della tabella 'User'
    await db.User.truncate({ cascade: true }); // Ripulisce i dati nella tabella User
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});

afterEach(async () => {
  // Aggiungi eventuali operazioni da eseguire dopo ogni test
});

afterAll(async () => {
  // Chiudi la connessione al database dopo tutti i test
  await db.sequelize.close();
});
