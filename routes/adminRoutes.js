const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { validateTokenAdmin } = require("../middlewares/authMiddleware");

router.get("/dashboard", validateTokenAdmin, adminController.getDashboardData);

module.exports = router;
