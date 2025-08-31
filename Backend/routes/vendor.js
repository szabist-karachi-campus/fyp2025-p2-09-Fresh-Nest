const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  createVendor,
  vendorSignIn,
  verifyOTP,
  resetPassword,
  ResendOTP,
  getVendors,
  uploadVendorCertification,
} = require("../controllers/vendor");

const { isVendorAuth } = require("../middleware/auth/vendorAuth");

const {
  validateVendorSignUp,
  validateVendorSignIn,
  validateResetPassword,
  Validation,
  validateForgotPassword,
  validateOTP,
} = require("../middleware/validation/vendor");
const { ConnectStripe, WithdrawVendorMoney } = require("../controllers/wallet");

const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("invalid image file!", false);
  }
};
const uploads = multer({ storage, fileFilter });

router.post("/vendorSignup", validateVendorSignUp, Validation, createVendor);
router.post("/vendorLogin", validateVendorSignIn, Validation, vendorSignIn);
router.post(
  "/vendorForgotPassword",
  validateForgotPassword,
  Validation,
  ResendOTP,
);
router.post("/vendorVerify", validateOTP, Validation, verifyOTP);
router.post(
  "/vendorResetPassword",
  validateResetPassword,
  Validation,
  resetPassword,
);
// router.post("/fetchLocation", isVendorAuth, fetchLocation);
router.post("/connectStripe", isVendorAuth, ConnectStripe);
router.post("/withdrawMoney", isVendorAuth, WithdrawVendorMoney);
router.get("/getVendors", getVendors);

router.post(
  "/uploadCirtificate",
  uploads.single("certification"),
  isVendorAuth,
  uploadVendorCertification,
);
router.get("/getCertificate", isVendorAuth, async (req, res) => {
  if (req?.vendor?.certificationImage) {
    return res.json({
      success: true,
      message: "Certificate Exists",
      cert: true,
    });
  } else {
    return res.json({
      success: true,
      message: "Certificate Exists",
      cert: false,
    });
  }
});
module.exports = router;
