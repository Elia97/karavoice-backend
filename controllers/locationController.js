const { Location } = require("../models");

exports.getAllLocations = async (_, res) => {
  try {
    const locations = await Location.findAllEntries(); // Usa il metodo statico
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero delle locazioni",
      error: error.message,
    });
  }
};

exports.getAllLocationsByCity = async (req, res) => {
  const { city } = req.params;
  try {
    const locations = await Location.findByCity(city); // Metodo personalizzato
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero delle locazioni per città",
      error: error.message,
    });
  }
};

exports.getLocationById = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await Location.findByPk(id); // Metodo Sequelize base
    if (!location) {
      return res.status(404).json({ message: "Locazione non trovata" });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero della locazione",
      error: error.message,
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { address } = req.body;

    // Verifica duplicati
    const isDuplicate = await Location.isDuplicateAddress(address);
    if (isDuplicate) {
      return res.status(400).json({ message: "Indirizzo già registrato" });
    }

    const location = await Location.create(req.body); // Crea una nuova locazione
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante la creazione della locazione",
      error: error.message,
    });
  }
};

exports.updateLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({ message: "Locazione non trovata" });
    }
    await location.update(req.body); // Aggiorna la locazione
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante l'aggiornamento della locazione",
      error: error.message,
    });
  }
};

exports.deleteLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({ message: "Locazione non trovata" });
    }
    await location.destroy(); // Elimina la locazione
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Errore durante l'eliminazione della locazione",
      error: error.message,
    });
  }
};

exports.getClosestLocation = async (req, res) => {
  const { latitude, longitude } = req.query;
  try {
    const location = await Location.findClosest(latitude, longitude); // Metodo personalizzato
    if (!location) {
      return res.status(404).json({ message: "Nessuna locazione trovata" });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero della locazione più vicina",
      error: error.message,
    });
  }
};

exports.getNearbyLocations = async (req, res) => {
  const { latitude, longitude, radius } = req.query;
  try {
    const locations = await Location.findNearby(latitude, longitude, radius); // Metodo personalizzato
    if (!locations.length) {
      return res
        .status(404)
        .json({ message: "Nessuna locazione trovata nelle vicinanze" });
    }
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero delle locazioni vicine",
      error: error.message,
    });
  }
};
