const { Booking, User, Event, Location } = require("../models");

// Ottieni tutte le prenotazioni
exports.getAllBookings = async (_, res) => {
  try {
    const bookings = await Booking.findAllEntries({
      include: [
        { model: User, as: "user" }, // Include la relazione con User
        {
          model: Event,
          as: "event", // Include la relazione con Event
          include: [
            { model: Location, as: "location" }, // Include la relazione con Location all'interno di Event
          ],
        },
      ],
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero delle prenotazioni",
      error: error.message,
    });
  }
};

// Ottieni una prenotazione per ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: ["user", "event"], // Include relazioni
    });
    if (!booking) {
      return res.status(404).json({ message: "Prenotazione non trovata" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero della prenotazione",
      error: error.message,
    });
  }
};

// Crea una nuova prenotazione
exports.createBooking = async (req, res) => {
  try {
    const { user_id, event_id, status, participants, notes } = req.body;
    const booking = await Booking.createEntry({
      user_id,
      event_id,
      status,
      participants,
      notes,
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante la creazione della prenotazione",
      error: error.message,
    });
  }
};

// Aggiorna lo stato di una prenotazione
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.updateStatus(req.params.id, status);
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante l'aggiornamento della prenotazione",
      error: error.message,
    });
  }
};

// Elimina una prenotazione
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Prenotazione non trovata" });
    }
    await booking.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Errore durante l'eliminazione della prenotazione",
      error: error.message,
    });
  }
};

// Ottieni le prenotazioni per un determinato utente
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.findByUser(req.user.id);
    if (bookings.length === 0) {
      return res.status(404).json({ message: "Nessuna prenotazione trovata" });
    }
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero delle prenotazioni",
      error: error.message,
    });
  }
};

// Ottieni le prenotazioni per un determinato evento
exports.getBookingsByEvent = async (req, res) => {
  try {
    const bookings = await Booking.findByEvent(req.params.eventId);
    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "Nessuna prenotazione trovata per l'evento" });
    }
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero delle prenotazioni per l'evento",
      error: error.message,
    });
  }
};
