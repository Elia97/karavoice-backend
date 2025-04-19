const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const {
  validateToken,
  validateTokenAdmin,
} = require("../middlewares/authMiddleware");

// Recupera tutte le prenotazioni
router.get("/", validateTokenAdmin, bookingController.getAllBookings);

// Recupera tutte le prenotazioni per l'utente loggato
router.get("/user", validateToken, bookingController.getBookingsByUser);

// Recupera tutte le prenotazioni per un determinato evento
router.get(
  "/event/:eventId",
  validateTokenAdmin,
  bookingController.getBookingsByEvent
);

// Recupera una prenotazione specifica per ID
router.get("/:id", validateToken, bookingController.getBookingById);

// Crea una nuova prenotazione
router.post("/", validateToken, bookingController.createBooking);

// Aggiorna lo stato di una prenotazione
router.put("/:id/status", validateToken, bookingController.updateBookingStatus);

// Elimina una prenotazione
router.delete("/:id", validateToken, bookingController.deleteBooking);

module.exports = router;
