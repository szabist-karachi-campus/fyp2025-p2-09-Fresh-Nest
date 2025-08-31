const express = require("express");

const {
  createSubscription,
  getUserSubscriptions,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscriptions");

const { isAuth } = require("../middleware/auth/userAuth");

const router = express.Router();

router.post("/createSubscription", isAuth, createSubscription);
router.get("/getUserSubscriptions", isAuth, getUserSubscriptions);
router.post("/updateSubscription", isAuth, updateSubscription);
router.delete("/cancelSubscription", isAuth, deleteSubscription);

module.exports = router;
