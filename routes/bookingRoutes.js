const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticate, checkAdmin } = require("../middlewares/authMiddleware");

// Recupera tutte le prenotazioni
router.get("/", authenticate, checkAdmin(), bookingController.getAllBookings);

// Recupera tutte le prenotazioni per l'utente loggato
router.get("/user", authenticate, bookingController.getBookingsByUser);

// Recupera tutte le prenotazioni per un determinato evento
router.get(
  "/event/:eventId",
  authenticate,
  checkAdmin(),
  bookingController.getBookingsByEvent
);

// Recupera una prenotazione specifica per ID
router.get("/:id", authenticate, bookingController.getBookingById);

// Crea una nuova prenotazione
router.post("/", authenticate, bookingController.createBooking);

// Aggiorna lo stato di una prenotazione
router.put("/:id/status", authenticate, bookingController.updateBookingStatus);

// Elimina una prenotazione
router.delete("/:id", authenticate, bookingController.deleteBooking);

module.exports = router;
