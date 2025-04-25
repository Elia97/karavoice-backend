module.exports = {
  testEnvironment: "node", // Ambiente di test per applicazioni Node.js
  verbose: true, // Mostra dettagli sui test eseguiti
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"], // File di setup da eseguire dopo l'ambiente di test
};
