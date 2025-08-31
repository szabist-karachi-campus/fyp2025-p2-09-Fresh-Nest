const express = require("express");
const { isCombinedAuth } = require("../middleware/auth/userAuth");
const {
  sendMessage,
  getAllThreads,
  getThreadByOrderId,
  getThreadById,
} = require("../controllers/message");

const router = express.Router();

router.post("/sendMessage", isCombinedAuth, sendMessage);
router.get("/getThread", getAllThreads);

router.post("/thread/:orderId", getThreadByOrderId);
router.get("/thread/:orderId", getThreadByOrderId);

router.get("/getThreadById/:id", getThreadById);

module.exports = router;
