const express = require("express");

const router = express.Router();

const { isVendorAuth } = require("../middleware/auth/vendorAuth");
const { isAuth } = require("../middleware/auth/userAuth");
const {
  createAd,
  updateAd,
  clickCount,
  getAds,
  getAdPerformance,
  getVendorAds,
  getBidRange,
  getAdbyProduct,
} = require("../controllers/ads");

router.post("/createAd", isVendorAuth, createAd);
router.put("/updateAd/:id", isVendorAuth, updateAd);
router.post("/clickCount", isAuth, clickCount);
router.get("/getAds", getAds);
router.get("/getAdPerformance/:id", isVendorAuth, getAdPerformance);
router.get("/getVendorAds", isVendorAuth, getVendorAds);
router.get("/getBidRange", getBidRange);
router.get("/getAdByProduct/:id", getAdbyProduct);

module.exports = router;
