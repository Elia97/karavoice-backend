const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Registrazione
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Crea un nuovo utente
    const newUser = await User.createEntry({
      name,
      email,
      password,
      role: role || "user", // Ruolo di default
    });

    return res
      .status(201)
      .json({ message: "Utente registrato con successo", user: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await User.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET, // Utilizza la variabile d'ambiente
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } // Imposta la scadenza, usa il valore di default se non specificato
    );

    res.cookie("token", token, {
      httpOnly: true, // Imposta il cookie come httpOnly per sicurezza
      secure: process.env.NODE_ENV === "production", // Imposta il flag secure in produzione
      maxAge: 7 * 24 * 60 * 60 * 1000, // Scadenza del cookie (7 giorni)
      sameSite: "Strict", // Imposta SameSite per prevenire CSRF

    })

    res.status(200).json({ message: "Login successful"});
  } catch (error) {
    res.status(500).json({ message: "Error during login", error: error });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id; // ID dell'utente autenticato
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Escludi la password dall'output
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout", error });
  }
}

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

// Aggiornare il profilo
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.user.id; // ID dell'utente autenticato

    // Trova l'utente per ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Aggiorna i campi dell'utente
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({ message: "Profile successfully updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error during profile update", error });
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
