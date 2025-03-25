const jwt = require("jsonwebtoken");

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

exports.checkAdmin = () => (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Accesso negato: permessi insufficienti" });
  }
  next();
};
