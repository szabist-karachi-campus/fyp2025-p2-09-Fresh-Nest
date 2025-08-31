const mongoose = require("mongoose");

const deletedVendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    cnic: {
      type: String,
      required: true,
      unique: true,
    },
    stripeConnectedId: {
      type: String,
      required: false,
    },
    deletedId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("deletedVendor", deletedVendorSchema);
