const { Event, Location, Category } = require("../models");

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAllEntries({
      include: [
        { model: Location, as: "location" },
        { model: Category, as: "category" },
      ],
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Errore nel recupero degli eventi",
      error: error.message,
    });
  }
};

exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.findUpcomingEvents();

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Errore nel recupero degli eventi futuri",
      error: error.message,
    });
  }
};

exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.findFeaturedEvents();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Errore nel recupero degli eventi in evidenza",
      error: error.message,
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findEntryById(req.params.id, {
      include: [
        { model: Location, as: "location" },
        { model: Category, as: "category" },
      ],
    }); // Usa il metodo base
    if (!event) {
      return res.status(404).json({ message: "Evento non trovato" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero dell'evento",
      error: error.message,
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.createEntry(req.body); // Usa il metodo base
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante la creazione dell'evento",
      error: error.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.updateEntry(req.params.id, req.body); // Usa il metodo base
    if (!event) {
      return res.status(404).json({ message: "Evento non trovato" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante l'aggiornamento dell'evento",
      error: error.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const success = await Event.deleteEntry(req.params.id); // Usa il metodo base
    if (!success) {
      return res.status(404).json({ message: "Evento non trovato" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Errore durante l'eliminazione dell'evento",
      error: error.message,
    });
  }
};
