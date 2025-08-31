const { check, validationResult } = require("express-validator");

exports.validateUserSignUp = [
  check("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Fullname is required!")
    .isLength({ min: 3, max: 50 })
    .withMessage("Fullname must be between 3 and 50 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Fullname must contain only alphabets!"),
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email")
    .not()
    .isEmpty()
    .withMessage("Email is required!"),
  check("phone")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Phone Number is required!")
    .isString()
    .withMessage("Valid Phone Number is required!")
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number should be exactly 11 characters!")
    .matches(/^03\d{9}$/)
    .withMessage("Invalid Phone Number!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be geater than 6 characters!"),
  check("confirmPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Confirm password is required!")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match!");
      }
      return true;
    }),
];

exports.validateUserSignIn = [
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
    .not()
    .isEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be geater than 6 characters!"),
  check("confirmPassword")
    .trim()
    .not()
    .isEmpty()
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

exports.validateAddress = [
  check("address")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Address is required!")
    .isString()
    .withMessage("Valid Address is required!"),
  check("city")
    .trim()
    .not()
    .isEmpty()
    .withMessage("City is required!")
    .isString()
    .withMessage("Valid City is required!"),
  check("state")
    .trim()
    .not()
    .isEmpty()
    .withMessage("State is required!")
    .isString()
    .withMessage("Valid State is required!"),
  check("postalcode")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Postal Code is required!")
    .isNumeric()
    .withMessage("Postal Code must be a number!")
    .isLength({ min: 5, max: 5 })
    .withMessage("Postal Code must be a 5-digit number!"),
];

exports.Validation = (req, res, next) => {
  const result = validationResult(req).array();
  if (!result.length) {
    return next();
  }

  const error = result[0].msg;
  res.json({ success: false, message: error });
};
