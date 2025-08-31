const { check, validationResult } = require("express-validator");

exports.validateVendorSignUp = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Fullname is required!")
    .isLength({ min: 3, max: 50 })
    .withMessage("Fullname must be between 3 and 50 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Fullname must contain only alphabets!"),
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required!"),
  check("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone Number is required!")
    .isString()
    .withMessage("Valid Phone Number is required!")
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number should be exactly 11 characters!")
    .matches(/^03\d{9}$/)
    .withMessage("Invalid Phone Number!"),
  check("cnic")
    .trim()
    .notEmpty()
    .withMessage("CNIC is required!")
    .isString()
    .withMessage("CNIC must be a valid string!")
    .matches(/^\d{5}-\d{7}-\d$/)
    .withMessage("Invalid CNIC format! (e.g., 12345-1234567-1)"),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters!"),
  check("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required!")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match!");
      }
      return true;
    }),
];

exports.validateVendorSignIn = [
  check("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),
  check("password").trim().notEmpty().withMessage("Password is required"),
];

exports.validateResetPassword = [
  check("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters!"),
  check("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required!")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match!");
      }
      return true;
    }),
];

exports.validateForgotPassword = [
  check("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),
];

exports.validateOTP = [
  check("otp").trim().notEmpty().withMessage("OTP is required"),
  check("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),
];

exports.Validation = (req, res, next) => {
  const result = validationResult(req).array();
  if (!result.length) {
    return next();
  }

  const error = result[0].msg;
  res.status(400).json({ success: false, message: error });
};
