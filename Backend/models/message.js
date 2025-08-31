const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Vendor", "SuperAdmin"],
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const messageThreadSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    title: {
      type: String,
      required: true,
    },
    initiatorId: {
      type: String,
      required: true,
    },
    initiatorModel: {
      type: String,
      required: true,
      enum: ["User", "Vendor", "SuperAdmin"],
    },
    receiverId: {
      type: String,
      required: true,
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ["User", "Vendor", "SuperAdmin"],
    },
    chats: [messageSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("MessageThread", messageThreadSchema);
