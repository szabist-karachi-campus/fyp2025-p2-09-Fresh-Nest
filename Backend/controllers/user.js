const User = require("../models/user");
const Wallet = require("../models/wallet");
const VerificationToken = require("../models/verificationToken");
const DeletedUsers = require("../models/deletedUsers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const {
  generateOTP,
  sendResetEmail,
  sendWelcomeEmail,
} = require("../utils/nodemailer");

const { sendNotificationToAdminApp } = require("../utils/notification");

const expiry = "1d";

const sendOTP = async (email, type) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found!");
  }
  const isVerificationToken = await VerificationToken.findOne({
    owner: user.email,
  });
  if (isVerificationToken) {
    await VerificationToken.deleteOne({ owner: user.email });
  }

  const otp = generateOTP();
  const verificationToken = new VerificationToken({
    owner: user.email,
    token: otp,
  });
  await verificationToken.save();
  console.log(otp, "OTP generated:");

  if (type === "resetEmail") {
    sendResetEmail(user, otp);
  } else if (type === "welcomeEmail") {
    sendWelcomeEmail(user, otp);
  }

  return user;
};

exports.createUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  isNewUser = await User.isEmailInUse(email);
  if (!isNewUser) {
    return res.json({
      success: false,
      message: "Email is already in use",
    });
  }
  isNewUser = await User.isPhoneInUse(phone);
  if (!isNewUser) {
    return res.json({
      success: false,
      message: "Phone Number is already in use",
    });
  }
  const wasUserDeleted = await DeletedUsers.findOne({ email });
  if (wasUserDeleted) {
    return res.json({
      success: false,
      message: "Your account was deleted, please contact support",
    });
  }
  const user = await User({
    name,
    email,
    phone,
    password,
  });
  await user.save();
  let wallet = await Wallet.findOne({ user: user.id, userType: "User" });
  if (!wallet) {
    await Wallet.create({
      user: user.id,
      userType: "User",
      balance: 0,
    });
  }
  sendOTP(user.email, "welcomeEmail");
  res.json({
    success: true,
    message: "Signup Successful",
    user,
  });
};

exports.userSignIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }
  isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.json({
      success: false,
      message: "Email / Password is incorrect!",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: expiry,
  });

  res.json({
    success: true,
    message: "User Logged In Successful!",
    user,
    token,
    expires: expiry,
  });
};

exports.ResendOTP = async (req, res, next) => {
  try {
    const { email, type } = req.body;
    const user = await sendOTP(email, type);
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      user,
    });
  } catch (error) {
    if (error.message === "User not found!") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

exports.verifyOTP = async (req, res) => {
  const { otp, email, type } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!otp) {
      return res.json({ success: false, message: "OTP is required" });
    }

    const verificationToken = await VerificationToken.findOne({
      owner: email,
    });
    if (!verificationToken) {
      return res.json({
        success: false,
        message: "OTP has expired or does not exist",
      });
    }
    const isValid = await bcrypt.compare(otp, verificationToken.token);
    if (!isValid) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (type === "welcomeEmail") {
      const newUser = await User.findByIdAndUpdate(
        user._id,
        { verified: true },
        { new: true },
      );
      user = newUser;
    }

    await VerificationToken.findOneAndDelete({ owner: email });
    res.json({ success: true, message: "OTP verified", user });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { confirmPassword, password, email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }
    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword)
      return res.json({
        success: false,
        message: "New password must be different!",
      });

    if (password.trim().length < 6 || password.trim().length > 20)
      return res.json({
        success: false,
        message: "Password must be atleast 6 characters long!",
      });

    user.password = password.trim();
    user.confirmPassword = confirmPassword.trim();
    await user.save();

    await VerificationToken.findOneAndDelete({ owner: user.email });

    if (user.deviceToken) {
      sendNotificationToAdminApp(
        user.deviceToken,
        "Password Reset Successful",
        "Your FreshNest password was successfully updated.",
      );
    }

    res.json({ success: true, message: "Password reset successful!", user });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "An error occurred while processing the request",
    });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { address, city, state, postalcode } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.address = address;
    user.city = city;
    user.state = state;
    user.postalcode = postalcode;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the address",
      error,
    });
  }
};
