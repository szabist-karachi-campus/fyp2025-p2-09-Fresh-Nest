const express = require("express");
const router = express.Router();
const {
  getVendorRevenue,
  getOrderAnalytics,
  getBestseller,
  getAdAnalytics,
  getSubscriptionAnalytics,
  getMonthlySalesAnalytics,
} = require("../controllers/analytics");
const { isVendorAuth } = require("../middleware/auth/vendorAuth");

router.get("/getVendorRevenue", isVendorAuth, getVendorRevenue);
router.get("/getOrderAnalytics", isVendorAuth, getOrderAnalytics);
router.get("/getBestseller", isVendorAuth, getBestseller);
router.get("/getAdAnalytics", isVendorAuth, getAdAnalytics);
router.get("/getSubscriptionAnalytics", isVendorAuth, getSubscriptionAnalytics);
router.get("/getMonthlySalesAnalytics", isVendorAuth, getMonthlySalesAnalytics);

module.exports = router;
