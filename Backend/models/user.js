const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
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
    verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalcode: {
      type: Number,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const hash = await bcrypt.hash(this.password, 8);
      this.password = hash;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("Password is required");
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log("Error in comparePassword", error.message);
    return false;
  }
};

userSchema.statics.isEmailInUse = async function (email) {
  if (!email) throw new Error("Email is required");
  try {
    const user = await this.findOne({ email });
    if (user) return false;
    return true;
  } catch (error) {
    console.log("Error in isEmailInUse", error.message);
    return false;
  }
};

userSchema.statics.isPhoneInUse = async function (phone) {
  if (!phone) throw new Error("Phone is required");
  try {
    const user = await this.findOne({ phone });
    if (user) return false;
    return true;
  } catch (error) {
    console.log("Error in isPhoneInUse", error.message);
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
