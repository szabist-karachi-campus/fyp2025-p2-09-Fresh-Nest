const express = require("express");
const {
  handleVendorStatus,
  showVendorWaitingList,
  getVendorsList,
  getUserList,
  deleteVendor,
  getVendorById,
  getAllUsers,
  getUserById,
  deleteUser,
  createSuperAdmin,
  getDeletedUsers,
  getDeletedVendors,
} = require("../controllers/superAdmin");
const { isSuperAdmin } = require("../middleware/auth/vendorAuth");

const router = express.Router();

router.post("/handleVendorStatus", isSuperAdmin, handleVendorStatus);
router.get("/getVendorsSuperAdmin", isSuperAdmin, getVendorsList);
router.get("/vendorWaitingList", isSuperAdmin, showVendorWaitingList);
router.get("/getVendorById/:id", isSuperAdmin, getVendorById);
router.post("/deleteVendor", isSuperAdmin, deleteVendor);

router.get("/getAllUsers", isSuperAdmin, getAllUsers);
router.post("/deleteUser", isSuperAdmin, deleteUser);
router.get("/getUserById/:id", isSuperAdmin, getUserById);

router.get("/getDeletedUsers", isSuperAdmin, getDeletedUsers);
router.get("/getDeletedVendors", isSuperAdmin, getDeletedVendors);

router.post("/create-superAdmin", isSuperAdmin, createSuperAdmin);

module.exports = router;
