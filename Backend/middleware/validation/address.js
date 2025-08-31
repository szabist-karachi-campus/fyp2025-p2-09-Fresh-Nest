const { check, validationResult } = require("express-validator");

exports.validateAddress = [
  check("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required!")
    .isLength({ min: 5, max: 100 })
    .withMessage("Address must be between 5 and 100 characters long."),
  check("city")
    .trim()
    .notEmpty()
    .withMessage("City is required!")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("City name must contain only alphabets!")
    .isLength({ min: 2, max: 50 })
    .withMessage("City name must be between 2 and 50 characters."),
  check("state")
    .trim()
    .notEmpty()
    .withMessage("State is required!")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("State must contain only alphabets!")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters."),
  check("postalcode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required!")
    .isNumeric()
    .withMessage("Postal code must be numeric!")
    .isLength({ min: 5, max: 5 })
    .withMessage("Postal code must be exactly 5 digits."),
];

exports.validateEditAddress = [
  check("address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Address must be between 5 and 100 characters long."),
  check("city")
    .optional()
    .trim()
    .isAlpha("en-US", { ignore: " " })
    .withMessage("City name must contain only alphabets!")
    .isLength({ min: 2, max: 50 })
    .withMessage("City name must be between 2 and 50 characters."),
  check("state")
    .optional()
    .trim()
    .isAlpha("en-US", { ignore: " " })
    .withMessage("State must contain only alphabets!")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters."),
  check("postalcode")
    .optional()
    .trim()
    .isNumeric()
    .withMessage("Postal code must be numeric!")
    .isLength({ min: 5, max: 5 })
    .withMessage("Postal code must be exactly 5 digits."),
];

// User Profile Validation
exports.validateUpdateProfile = [
  check("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters!")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name must contain only alphabets."),
  check("email")
    .optional()
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email format."),
  check("phone")
    .optional()
    .trim()
    .matches(/^03\d{9}$/)
    .withMessage("Phone number must start with 03 and be 11 digits."),
];

// Password Change Validation
exports.validateChangePassword = [
  check("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("Old password is required!"),
  check("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required!")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters."),
  check("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required!")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords must match!");
      }
      return true;
    }),
];

exports.Validation = (req, res, next) => {
  const errors = validationResult(req).array();
  if (!errors.length) {
    return next();
  }

  const errorMessage = errors[0].msg;
  res.status(400).json({
    success: false,
    message: errorMessage,
  });
};
