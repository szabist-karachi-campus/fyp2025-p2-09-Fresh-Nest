const express = require("express");

const router = express.Router();

const { isCombinedAuth } = require("../middleware/auth/userAuth");
const { createPaymentIntent } = require("../controllers/payment");

router.post("/createPaymentIntent", isCombinedAuth, createPaymentIntent);

module.exports = router;
