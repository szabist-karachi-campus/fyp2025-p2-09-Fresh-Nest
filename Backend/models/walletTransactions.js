const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Wallet",
    },
    amount: { type: Number, required: true },
    transactionType: {
      type: String,
      enum: ["Credit", "Debit"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
