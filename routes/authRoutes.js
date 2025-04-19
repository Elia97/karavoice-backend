const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validateToken,
} = require("../middlewares/authMiddleware");

// Rotte per l'autenticazione
router.post("/register", validateRegister, authController.registerUser); // Registrazione
router.post("/login", validateLogin, authController.loginUser); // Login
router.post(
  "/change-password",
  validateToken,
  validateLogin,
  authController.changePassword
); // Cambia password
router.post("/restore-user", validateToken, authController.restoreUser); // Ripristina utente
router.post("/update-profile", validateToken, authController.updateProfile);

module.exports = router;
