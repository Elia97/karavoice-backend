const express = require("express");
const db = require("./models/index");
const {
  eventRoutes,
  locationRoutes,
  categoryRoutes,
  bookingRoutes,
  userRoutes,
  authRoutes,
  uploadRoutes,
} = require("./routes");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // Per il parsing del corpo delle richieste JSON
app.use(express.urlencoded({ extended: true })); // Per il parsing del corpo delle richieste URL-encoded
app.use(helmet()); // Aggiunge intestazioni di sicurezza per proteggere l'app
app.use(morgan("dev")); // Log delle richieste HTTP per il debug

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
); // Abilita CORS per il frontend

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
      res.set("Access-Control-Allow-Origin", "http://localhost:5173");
    },
  })
); // Serve i file statici dalla cartella "uploads"

// Rotte
app.use("/api/events", eventRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api", uploadRoutes);
app.use("/auth", authRoutes);

app.get("/", (_, res) => {
  res.status(200).json({
    message: "Backend KaraVoice è attivo e funzionante",
    database: "connesso",
    date: new Date().toLocaleDateString(),
  });
}); // Rotta di test per verificare che il server sia in esecuzione

// Gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Errore interno del server",
    },
  });
});

app.use((_, res) => {
  res.status(404).json({
    error: "Risorsa non trovata",
  });
});

// Esporta l'app per i test
module.exports = app;

// Avvia il server solo se esegui direttamente `index.js`
if (require.main === module) {
  const startServer = async () => {
    try {
      await db.sequelize.authenticate();
      console.log("Connessione al database riuscita.");
      app.listen(PORT, () => {
        console.log(`Server in ascolto su http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("Errore durante la connessione al database:", error);
      process.exit(1);
    }
  };

  startServer();
}
