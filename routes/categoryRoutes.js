const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Rotte per le categorie
router.get("/", categoryController.getAllCategories);

module.exports = router;
