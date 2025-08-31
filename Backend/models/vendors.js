const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const vendorSchema = new mongoose.Schema(
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
    deviceToken: {
      type: String,
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
    certificationImage: {
      type: String,
    },
  },
  { timestamps: true },
);

vendorSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt.hash(this.password, 8, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  }
});

vendorSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("Password is required");
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log("Error in comparePassword", error.message);
    return false;
  }
};

vendorSchema.statics.isEmailInUse = async function (email) {
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

vendorSchema.statics.isPhoneInUse = async function (phone) {
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

vendorSchema.statics.isCNICInUse = async function (cnic) {
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

module.exports = mongoose.model("Vendor", vendorSchema);
