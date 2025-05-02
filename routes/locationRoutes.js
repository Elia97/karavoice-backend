const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");
const {
  validateToken,
  validateTokenAdmin,
} = require("../middlewares/authMiddleware");
const { validateLocation } = require("../middlewares/locationMiddleware");

// Rotte per le locazioni
router.get("/", locationController.getAllLocations); // Ottieni tutte le locazioni

router.get(
  "/by-city/:city",
  validateToken,
  locationController.getAllLocationsByCity
); // Ottieni tutte le locazioni in una città specifica

router.get("/closest", validateToken, locationController.getClosestLocation); // Ottieni la locazione più vicina a una coppia di coordinate (pubblica)

router.get("/nearby", validateToken, locationController.getNearbyLocations); // Ottieni locazioni vicine a una coppia di coordinate (pubblica)

router.get("/:id", validateTokenAdmin, locationController.getLocationById); // Ottieni una locazione per ID

router.post(
  "/",
  validateTokenAdmin,
  validateLocation,
  locationController.createLocation
); // Crea una nuova locazione

router.put(
  "/:id",
  validateTokenAdmin,
  validateLocation,
  locationController.updateLocation
); // Aggiorna una locazione

router.delete("/:id", validateTokenAdmin, locationController.deleteLocation); // Elimina una locazione

module.exports = router;
