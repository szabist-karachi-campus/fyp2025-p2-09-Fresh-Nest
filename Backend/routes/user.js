const express = require("express");

const router = express.Router();
const {
  createUser,
  userSignIn,
  verifyOTP,
  resetPassword,
  ResendOTP,
  addAddress,
} = require("../controllers/user");
const {
  validateUserSignUp,
  validateUserSignIn,
  validateResetPassword,
  Validation,
  validateForgotPassword,
  validateOTP,
  validateAddress,
} = require("../middleware/validation/user");
const { isAuth } = require("../middleware/auth/userAuth");

router.post("/signup", validateUserSignUp, Validation, createUser);
router.post("/login", validateUserSignIn, Validation, userSignIn);
router.post("/forgot-password", validateForgotPassword, Validation, ResendOTP);
router.post("/verifyOTP", validateOTP, Validation, verifyOTP);
router.post("/resetPassword", validateResetPassword, Validation, resetPassword);
router.post("/addAddress", isAuth, validateAddress, Validation, addAddress);

module.exports = router;
