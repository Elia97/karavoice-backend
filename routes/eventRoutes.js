const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const {
  validateToken,
  validateTokenAdmin,
} = require("../middlewares/authMiddleware");

// Rotte pubbliche
router.get("/upcoming", eventController.getUpcomingEvents); // Ottieni eventi futuri

// Rotte protette (tutti gli utenti)
router.get("/:id", validateToken, eventController.getEventById); // Ottieni un evento specifico tramite ID

// Rotte protette (solo admin)
router.get("/", validateTokenAdmin, eventController.getAllEvents); // Ottieni tutti gli eventi

router.post("/", validateTokenAdmin, eventController.createEvent); // Crea un nuovo evento

router.put("/:id", validateTokenAdmin, eventController.updateEvent); // Aggiorna un evento

router.delete("/:id", validateTokenAdmin, eventController.deleteEvent); // Elimina un evento

module.exports = router;
