const express = require("express");
const { getUploadUrl } = require("../utils/cloudflare");
const { validateTokenAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rotta per il caricamento
router.post("/", validateTokenAdmin, async (req, res) => {
  try {
    const result = await getUploadUrl();
    res.json({ uploadURL: result.uploadURL, id: result.id });
  } catch (error) {
    console.error("Errore ottenendo upload URL da Cloudflare", error);
    res.status(500).json({ error: "Errore nel generare l'upload URL" });
  }
});

module.exports = router;
