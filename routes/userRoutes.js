const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, checkAdmin } = require("../middlewares/authMiddleware");

// Rotte per gli utenti
router.get("/", authenticate, checkAdmin(), userController.getAllUsers);

router.get("/:id", authenticate, userController.getUserById);

router.get(
  "/email/:email",
  authenticate,
  checkAdmin(),
  userController.getUserByEmail
);

router.get(
  "/role/:role",
  authenticate,
  checkAdmin(),
  userController.getUsersByRole
);

router.get(
  "/inactive/:days",
  authenticate,
  checkAdmin(),
  userController.getInactiveUsers
);

router.put("/:id", authenticate, userController.updateUser);
router.put("/last-login/:id", authenticate, userController.updateLastLogin);
router.delete("/:id", authenticate, userController.deleteUser);

module.exports = router;
