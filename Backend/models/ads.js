const mongoose = require("mongoose");

const adsSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ad", adsSchema);
