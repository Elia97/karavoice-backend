const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");
const { authenticate, checkAdmin } = require("../middlewares/authMiddleware");

// Rotte per le locazioni
router.get("/", authenticate, checkAdmin(), locationController.getAllLocations); // Ottieni tutte le locazioni

router.get(
  "/by-city/:city",
  authenticate,
  locationController.getAllLocationsByCity
); // Ottieni tutte le locazioni in una città specifica

router.get("/closest", locationController.getClosestLocation); // Ottieni la locazione più vicina a una coppia di coordinate (pubblica)

router.get("/nearby", locationController.getNearbyLocations); // Ottieni locazioni vicine a una coppia di coordinate (pubblica)

router.get(
  "/:id",
  authenticate,
  checkAdmin(),
  locationController.getLocationById
); // Ottieni una locazione per ID

router.post("/", authenticate, checkAdmin(), locationController.createLocation); // Crea una nuova locazione

router.put(
  "/:id",
  authenticate,
  checkAdmin(),
  locationController.updateLocation
); // Aggiorna una locazione

router.delete(
  "/:id",
  authenticate,
  checkAdmin(),
  locationController.deleteLocation
); // Elimina una locazione

module.exports = router;
