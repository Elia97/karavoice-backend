const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rotte per l'autenticazione
router.post("/register", authController.registerUser); // Registrazione
router.post("/login", authController.loginUser); // Login
router.post("/change-password", authController.changePassword); // Cambia password
router.post("/restore-user", authController.restoreUser); // Ripristina utente

module.exports = router;
