const { User } = require("../models");

/**
 * Ottieni tutti gli utenti
 */
exports.getAllUsers = async (_, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero degli utenti",
      error: error.message,
    });
  }
};

/**
 * Ottieni un utente per ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero dell'utente",
      error: error.message,
    });
  }
};

/**
 * Aggiorna un utente
 */
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    await user.update(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante l'aggiornamento dell'utente",
      error: error.message,
    });
  }
};

/**
 * Elimina un utente
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    await user.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Errore durante l'eliminazione dell'utente",
      error: error.message,
    });
  }
};

/**
 * Trova un utente per email
 */
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero dell'utente per email",
      error: error.message,
    });
  }
};

/**
 * Trova utenti per ruolo
 */
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.findByRole(role);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero degli utenti per ruolo",
      error: error.message,
    });
  }
};

/**
 * Trova utenti inattivi
 */
exports.getInactiveUsers = async (req, res) => {
  try {
    const { days } = req.params;
    const users = await User.findInactiveUsers(parseInt(days, 10));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero degli utenti inattivi",
      error: error.message,
    });
  }
};
