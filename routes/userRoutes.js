const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  validateToken,
  validateTokenAdmin,
} = require("../middlewares/authMiddleware");
const { validateUser } = require("../middlewares/userMiddleware");

// Rotte per gli utenti
router.get("/", validateTokenAdmin, userController.getAllUsers);

router.get("/:id", validateToken, userController.getUserById);

router.get("/email/:email", validateTokenAdmin, userController.getUserByEmail);

router.get("/role/:role", validateTokenAdmin, userController.getUsersByRole);

router.get(
  "/inactive/:days",
  validateTokenAdmin,
  userController.getInactiveUsers
);

router.put("/:id", validateToken, validateUser, userController.updateUser);
router.delete("/:id", validateToken, userController.deleteUser);

module.exports = router;
