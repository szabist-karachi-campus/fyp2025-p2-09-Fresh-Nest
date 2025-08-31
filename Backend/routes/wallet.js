const express = require("express");

const router = express.Router();

const { isVendorAuth } = require("../middleware/auth/vendorAuth");
const {
  getVendorWallet,
  getUserWallet,
  getWalletTransactions,
  topUpWallet,
} = require("../controllers/wallet");
const { isAuth, isCombinedAuth } = require("../middleware/auth/userAuth");

router.get("/getVendorWallet", isVendorAuth, getVendorWallet);
router.get("/getUserWallet", isAuth, getUserWallet);
router.get("/getTransactions/:id", getWalletTransactions);
router.post("/topUpWallet", isCombinedAuth, topUpWallet);

module.exports = router;
