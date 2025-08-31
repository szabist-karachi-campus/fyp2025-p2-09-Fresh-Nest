const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "userType",
  },
  userType: {
    type: String,
    required: true,
    enum: ["User", "Vendor"],
  },
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model("Wallet", WalletSchema);
