const { check, validationResult } = require("express-validator");

exports.validateUser = [
  check("name")
    .notEmpty()
    .withMessage("Il nome non può essere vuoto.")
    .isLength({ max: 100 })
    .withMessage("Il nome non può superare i 100 caratteri."),
  check("email")
    .notEmpty()
    .withMessage("L'email non può essere vuota.")
    .isEmail()
    .withMessage("Inserisci un indirizzo email valido.")
    .isLength({ max: 100 })
    .withMessage("L'email non può superare i 100 caratteri."),
  check("password")
    .notEmpty()
    .withMessage("La password non può essere vuota.")
    .isLength({ min: 6 })
    .withMessage("La password deve contenere almeno 6 caratteri.")
    .isLength({ max: 255 })
    .withMessage("La password non può superare i 255 caratteri."),
  check("role")
    .optional()
    .default("user")
    .isIn(["user", "admin"])
    .withMessage("Il ruolo deve essere 'user' o 'admin'."),
  check("last_login_at")
    .optional()
    .isISO8601()
    .withMessage("La data di ultimo accesso deve essere in formato ISO 8601."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
