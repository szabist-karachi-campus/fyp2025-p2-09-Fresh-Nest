const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const vendorWaitingListSchema = new mongoose.Schema(
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
    verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    stripeConnectedId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

vendorWaitingListSchema.statics.isEmailInUse = async function (email) {
  if (!email) throw new Error("Email is required");
  try {
    const user = await this.findOne({ email: email });
    if (user) return false;
    return true;
  } catch (error) {
    console.log("Error in isEmailInUse", error.message);
    return false;
  }
};

vendorWaitingListSchema.statics.isPhoneInUse = async function (phone) {
  if (!phone) throw new Error("Phone is required");
  try {
    const user = await this.findOne({ phone: phone });
    if (user) return false;
    return true;
  } catch (error) {
    console.log("Error in isPhoneInUse", error.message);
    return false;
  }
};

vendorWaitingListSchema.statics.isCNICInUse = async function (cnic) {
  if (!cnic) throw new Error("CNIC is required");
  try {
    const user = await this.findOne({ cnic: cnic });
    if (user) return false;
    return true;
  } catch (error) {
    console.log("Error in isCNICInUse", error.message);
    return false;
  }
};

module.exports = mongoose.model("VendorWaitingList", vendorWaitingListSchema);
