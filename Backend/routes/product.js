const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProduct,
  editProduct,
  deleteProduct,
  uploadProductImage,
  getVendorProducts,
  viewCount,
} = require("../controllers/product");
const {
  validateProduct,
  Validation,
} = require("../middleware/validation/product");
const { isVendorAuth } = require("../middleware/auth/vendorAuth");

const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("invalid image file!", false);
  }
};
const uploads = multer({ storage, fileFilter });

router.post(
  "/createProduct",
  isVendorAuth,
  validateProduct,
  Validation,
  createProduct,
);
router.post(
  "/editProduct/:id",
  isVendorAuth,
  validateProduct,
  Validation,
  editProduct,
);
router.delete("/deleteProduct/:id", isVendorAuth, deleteProduct);
router.post(
  "/uploadProductImage/:id",
  uploads.array("product", 3),
  isVendorAuth,
  uploadProductImage,
);

router.post("/viewCount", viewCount);

router.get("/getProducts", getProducts);
router.get("/getVendorProducts", isVendorAuth, getVendorProducts);
router.get("/getProduct/:id", getProduct);

module.exports = router;
