const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticate, checkAdmin } = require("../middlewares/authMiddleware");

// Rotte pubbliche
router.get("/upcoming", eventController.getUpcomingEvents); // Ottieni eventi futuri

// Rotte protette (tutti gli utenti)
router.get("/:id", authenticate, eventController.getEventById); // Ottieni un evento specifico tramite ID

// Rotte protette (solo admin)
router.get("/", authenticate, checkAdmin(), eventController.getAllEvents); // Ottieni tutti gli eventi

router.post("/", authenticate, checkAdmin(), eventController.createEvent); // Crea un nuovo evento

router.put("/:id", authenticate, checkAdmin(), eventController.updateEvent); // Aggiorna un evento

router.delete("/:id", authenticate, checkAdmin(), eventController.deleteEvent); // Elimina un evento

module.exports = router;
