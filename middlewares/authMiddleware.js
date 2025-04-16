const jwt = require("jsonwebtoken");

// Middleware per autenticare l'utente
exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Accesso non consentito" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Aggiunge il payload del token alla richiesta
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token non valido", error });
  }
};

// Middleware per verificare se l'utente è un admin
exports.checkAdmin = () => (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Accesso negato: permessi insufficienti" });
  }
  next();
};

// Middleware per verificare se l'email è corretta
exports.checkEmail = () => (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({message: "Email non valida"});
  }
  next();
}

// Middleware per verificare se la password è corretta
exports.checkPassword = () => (req, res, next) => {
  const { password } = req.body;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Almeno 8 caratteri, almeno una lettera e un numero
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({ message: "Password non valida"});
  }
  next();
}

// Middleware per verificare il nome utente è corretto
exports.checkUsername = () => (req, res, next) => {
  const { username } = req.body;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Almeno 3 caratteri, massimo 20, solo lettere, numeri e underscore
  if (!username || !usernameRegex.test(username)) {
    return res.status(400).json({ message: "Nome utente non valido"});
  }
  next();
}