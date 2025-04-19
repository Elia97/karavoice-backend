const { check, validationResult } = require("express-validator");
const Location = require("../models/Location");

exports.validateLocation = [
  check("name")
    .notEmpty()
    .withMessage("Il nome della location non può essere vuoto.")
    .isLength({ max: 255 })
    .withMessage("Il nome della location non può superare i 255 caratteri."),
  check("address")
    .notEmpty()
    .withMessage("L'indirizzo non può essere vuoto.")
    .isLength({ max: 255 })
    .withMessage("L'indirizzo non può superare i 255 caratteri.")
    .custom(async (value, { req }) => {
      const locationId = req.params.id;
      const existingLocation = await Location.isDuplicateAddress(
        value,
        locationId
      );
      if (existingLocation) throw new Error("Indirizzo già registrato.");
      return true;
    }),
  check("city")
    .notEmpty()
    .withMessage("La città non può essere vuota.")
    .isLength({ max: 100 })
    .withMessage("La città non può superare i 100 caratteri."),
  check("province")
    .optional()
    .isLength({ max: 100 })
    .withMessage("La provincia non può superare i 100 caratteri."),
  check("zip_code")
    .notEmpty()
    .withMessage("Il CAP non può essere vuoto.")
    .isNumeric()
    .withMessage("Il CAP deve contenere solo numeri.")
    .isLength({ min: 4, max: 10 })
    .withMessage("Il CAP deve essere lungo tra 4 e 10 caratteri."),
  check("country")
    .notEmpty()
    .withMessage("Il paese non può essere vuoto.")
    .isLength({ max: 100 })
    .withMessage("Il paese non può superare i 100 caratteri."),
  check("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("La latitudine deve essere un numero compreso tra -90 e 90."),
  check("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage(
      "La longitudine deve essere un numero compreso tra -180 e 180."
    ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
