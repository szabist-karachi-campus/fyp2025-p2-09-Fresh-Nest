const express = require("express");

const router = express.Router();

const { isAuth } = require("../middleware/auth/userAuth");
const { isVendorAuth } = require("../middleware/auth/vendorAuth");
const {
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getUserAddress,
  getVendorOrders,
  getVendorSales,
  getProductSalesInfo,
  cancelOrder,
  cancelOrderById,
} = require("../controllers/order");

router.post("/createOrder", isAuth, createOrder);
router.post("/updateOrderStatus/:id", updateOrderStatus);
router.get("/getUserOrder", isAuth, getUserOrders);
router.post("/cancelOrder", cancelOrder);
router.post("/cancelOrderById", cancelOrderById);
router.get("/getUserAddress/:id", getUserAddress);
router.get("/getVendorOrders", isVendorAuth, getVendorOrders);
router.get("/getVendorSales", isVendorAuth, getVendorSales);
// router.get("/getProductSalesInfo/:id", isVendorAuth, getProductSalesInfo);

module.exports = router;
