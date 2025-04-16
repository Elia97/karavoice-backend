const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { checkUsername, checkEmail, checkPassword, authenticate} = require("../middlewares/authMiddleware")
 
// Rotte per l'autenticazione
router.post("/register", checkUsername, checkEmail, checkPassword, authController.registerUser); // Registrazione
router.post("/login", checkEmail, checkPassword, authController.loginUser); // Login
router.post("/change-password", checkPassword, authController.changePassword); // Cambia password
router.post("/restore-user", authenticate, authController.restoreUser); // Ripristina utente

module.exports = router;
