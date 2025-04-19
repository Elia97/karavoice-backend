const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

exports.validateRegister = [
  check("name")
    .notEmpty()
    .withMessage("Il nome è obbligatorio")
    .isLength({ min: 2 })
    .withMessage("Il nome deve avere almeno 2 caratteri"),
  check("email")
    .isEmail()
    .withMessage("Email non valida")
    .custom(async (value) => {
      const existingUser = await User.findByEmail(value);
      if (existingUser) throw new Error("Email già registrata");
    }),
  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Il ruolo deve essere 'user' o 'admin'"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("La password deve avere almeno 6 caratteri"),
  check("passwordConfirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Le password non corrispondono");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array({ onlyFirstError: true });
      const message = error[0].msg;
      return res.status(422).json({ error: message });
    } else {
      next();
    }
  },
];

exports.validateLogin = [
  check("email")
    .notEmpty()
    .withMessage("L'email è obbligatoria")
    .isEmail()
    .withMessage("Email non valida"),
  check("password").notEmpty().withMessage("La password è obbligatoria"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array({ onlyFirstError: true });
      const message = error[0].msg;
      return res.status(422).json({ error: message });
    }

    next();
  },
];

exports.validateChangePassword = [
  check("email").isEmail().withMessage("Email non valida"),
  check("oldPassword")
    .notEmpty()
    .withMessage("La password attuale è obbligatoria"),
  check("newPassword")
    .notEmpty()
    .withMessage("La nuova password è obbligatoria")
    .isLength({ min: 6 })
    .withMessage("La nuova password deve avere almeno 6 caratteri"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array({ onlyFirstError: true });
      const message = error[0].msg;
      return res.status(422).json({ error: message });
    }
    next();
  },
];

exports.validateRestoreUser = [
  check("email")
    .notEmpty()
    .withMessage("L'email è obbligatoria")
    .isEmail()
    .withMessage("Email non valida")
    .custom(async (value) => {
      const existingUser = await User.findByEmail(value);
      if (!existingUser) throw new Error("Email non registrata");
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array({ onlyFirstError: true });
      const message = error[0].msg;
      return res.status(422).json({ error: message });
    }
    next();
  },
];

exports.validateUpdateProfile = [
  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Il nome deve avere almeno 2 caratteri"),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Email non valida")
    .custom(async (value, { req }) => {
      const existingUser = await User.findByEmail(value);
      if (existingUser && existingUser.id !== req.user.id)
        throw new Error("Email già registrata");
    }),
  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Il ruolo deve essere 'user' o 'admin'"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array({ onlyFirstError: true });
      const message = error[0].msg;
      return res.status(422).json({ error: message });
    }
    next();
  },
];

exports.validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token non fornito" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const message =
        err.name === "TokenExpiredError" ? "Token scaduto" : "Token non valido";
      return res.status(401).json({ message });
    }
    req.user = decoded;
    next();
  });
};

exports.validateTokenAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token non fornito" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const message =
        err.name === "TokenExpiredError" ? "Token scaduto" : "Token non valido";
      return res.status(401).json({ message });
    }
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Accesso negato: permessi insufficienti" });
    }
    req.user = decoded;
    next();
  });
};
