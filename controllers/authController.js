const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Registrazione
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Controlla se l'email è già in uso
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Crea un nuovo utente
    const newUser = await User.create({
      name,
      email,
      password_hashed: password,
      role: role || "user", // Ruolo di default
    });

    res
      .status(201)
      .json({ message: "User successfully registered", user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trova l'utente per email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verifica la password usando il metodo isPasswordValid nel modello
    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Genera il token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET // Utilizza la variabile d'ambiente
      // { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } // Imposta la scadenza, usa il valore di default se non specificato
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error: error });
  }
};

// Cambiare la password
exports.changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Trova l'utente per email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verifica la password vecchia usando il metodo isPasswordValid
    const isOldPasswordValid = await user.isPasswordValid(oldPassword);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Cripta la nuova password e aggiorna l'utente
    user.password_hashed = newPassword; // Il modello si occuperà di fare l'hashing
    await user.save();

    res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    res.status(500).json({ message: "Error during password change", error });
  }
};

// Ripristinare l'utente eliminato
exports.restoreUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Trova l'utente eliminato (soft delete)
    const user = await User.findOne({
      where: { email, deletedAt: { [Op.ne]: null } },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found or not deleted" });
    }

    // Ripristina l'utente
    user.deletedAt = null;
    await user.save();

    res.status(200).json({ message: "User successfully restored", user });
  } catch (error) {
    res.status(500).json({ message: "Error during user restoration", error });
  }
};
