const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticate, checkAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Configurazione Multer: accetta solo file immagine in formato WebP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Crea la cartella se non esiste
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accetta solo file con estensione .webp
  if (file.mimetype === "image/webp") {
    cb(null, true);
  } else {
    cb(new Error("Solo file immagine WebP sono accettati"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

// Rotta per il caricamento
router.post(
  "/upload",
  upload.single("image"),
  authenticate,
  checkAdmin(), // Solo il ruolo admin è autorizzato
  async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "Nessun file caricato" });
      }

      // Restituisci l'URL del file caricato
      res.status(200).json({
        message: "File WebP caricato con successo",
        url: `/uploads/${file.filename}`,
      });
    } catch (error) {
      res.status(500).json({
        message: "Errore durante il caricamento",
        error: error.message,
      });
    }
  }
);

module.exports = router;
