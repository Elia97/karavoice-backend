const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rotte per l'autenticazione
router.post("/register", authController.registerUser); // Registrazione
router.post("/login", authController.loginUser); // Login

module.exports = router;
