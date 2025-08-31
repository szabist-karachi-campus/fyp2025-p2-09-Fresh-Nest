const Vendor = require("../models/vendors");
const VerificationToken = require("../models/verificationToken");
const vendorWaitingList = require("../models/vendorWaitingList");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cloudinary = require("../helper/cloudinary");

const {
  generateOTP,
  sendResetEmail,
  sendVendorWelcomeEmail,
  sendVendorEmailVerificationOTP,
} = require("../utils/nodemailer");
const DeletedVendor = require("../models/deletedVendor");

const { sendNotificationToAdminApp } = require("../utils/notification");

const expiry = "1d";

const sendOTP = async (email, type) => {
  let vendor;

  if (type === "waiting") {
    vendor = await vendorWaitingList.findOne({ email });
    if (!vendor) throw new Error("Vendor not found in waiting list!");
  } else {
    vendor = await Vendor.findOne({ email });
    if (!vendor) throw new Error("Vendor not found!");
  }

  await VerificationToken.deleteOne({ owner: vendor.email });

  const otp = generateOTP();
  await new VerificationToken({ owner: vendor.email, token: otp }).save();
  console.log("OTP generated:", otp);

  switch (type) {
    case "waiting":
      sendVendorEmailVerificationOTP(vendor, otp);
      break;
    case "resetEmail":
      sendResetEmail(vendor, otp);
      break;
    case "welcomeEmail":
      sendVendorWelcomeEmail(vendor, otp);
      break;
    default:
      throw new Error(`Unsupported OTP type: ${type}`);
  }

  return vendor;
};

exports.createVendor = async (req, res) => {
  const { name, email, phone, cnic, password } = req.body;
  isNewVendor = await Vendor.isEmailInUse(email);
  if (!isNewVendor) {
    return res.json({
      success: false,
      message: "Email is already in use",
    });
  }

  isNewVendor = await vendorWaitingList.isEmailInUse(email);
  if (!isNewVendor) {
    return res.json({
      success: false,
      message:
        "Email is already in waiting List, Please wait for Admin Approval",
    });
  }

  isNewVendor = await Vendor.isPhoneInUse(phone);
  if (!isNewVendor) {
    return res.json({
      success: false,
      message: "Phone Number is already in use",
    });
  }

  isNewVendor = await vendorWaitingList.isPhoneInUse(phone);
  if (!isNewVendor) {
    return res.json({
      success: false,
      message:
        "Phone Number is already in waiting List, Please wait for Admind Approval",
    });
  }

  isNewVendor = await Vendor.isCNICInUse(cnic);
  if (!isNewVendor) {
    return res.json({
      success: false,
      message: "CNIC is already in use",
    });
  }

  isNewVendor = await vendorWaitingList.isCNICInUse(cnic);
  if (!isNewVendor) {
    return res.json({
      success: false,
      message:
        "CNIC is already in waiting List, Please wait for Admin Approval",
    });
  }
  const wasUserDeleted = await DeletedVendor.findOne({ email });
  if (wasUserDeleted) {
    return res.json({
      success: false,
      message: "Your account was terminated, please contact support",
    });
  }
  const vendor = await vendorWaitingList({
    name,
    email,
    phone,
    cnic,
    password,
  }).save();
  sendOTP(vendor.email, "waiting");

  return res.json({
    success: true,
    message: "Vendor created successfully",
  });
};

exports.vendorSignIn = async (req, res) => {
  const { email, password, deviceToken } = req.body;
  const isVendorInWaitingList = await vendorWaitingList.findOne({ email });
  if (isVendorInWaitingList) {
    return res.json({
      success: false,
      message:
        "Your request is in waitling list, Please wait for Admin Approval",
    });
  }
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    return res.json({ success: false, message: "Vendor not found" });
  }
  const isMatch = await vendor.comparePassword(password);
  if (!isMatch) {
    return res.json({ success: false, message: "Invalid Password" });
  }
  const token = jwt.sign({ email: vendor.email }, process.env.JWT_SECRET, {
    expiresIn: expiry,
  });
  console.log(deviceToken);
  if (deviceToken) {
    await Vendor.findByIdAndUpdate(vendor.id, {
      deviceToken,
    });
  }
  return res.json({
    success: true,
    message: "Vendor signed in successfully",
    token,
    vendor,
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
  try {
    const { otp, email, type } = req.body;
    let vendor = await vendorWaitingList.findOne({ email });
    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found" });
    }

    if (!otp) {
      return res.json({ success: false, message: "OTP is required" });
    }

    const verificationToken = await VerificationToken.findOne({ owner: email });
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
      const newVendor = await vendorWaitingList.findByIdAndUpdate(
        vendor._id,
        { verified: true },
        { new: true },
      );
      vendor = newVendor;
    }

    await VerificationToken.findOneAndDelete({ owner: email });
    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server Error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, email } = req.body;
    console.log(email);
    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found!" });
    }

    const isSamePassword = await vendor.comparePassword(password);
    if (isSamePassword) {
      return res.json({
        success: false,
        message: "New password must be different!",
      });
    }

    if (password.trim().length < 6 || password.trim().length > 20)
      return res.json({
        success: false,
        message: "Password must be atleast 6 characters long!",
      });

    vendor.password = password.trim();
    vendor.confirmPassword = confirmPassword.trim();
    await vendor.save();

    if (vendor.deviceToken) {
      sendNotificationToAdminApp(
        user.deviceToken,
        "Password Reset Successful",
        "Your FreshNest password was successfully updated.",
      );
    }

    await VerificationToken.findOneAndDelete({ owner: vendor.email });
    res.json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
};

exports.getVendors = async (res) => {
  try {
    const vendors = await Vendor.find();
    res.json({ success: true, vendors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
};

exports.fetchLocation = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const { location } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { location: location },
      { new: true },
    );

    res.json({ success: true, vendor });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
};

exports.uploadVendorCertification = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    console.log("Parsed body and req.file", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a certification image",
      });
    }

    const result = await cloudinary.cloudinary.uploader.upload(req.file.path, {
      folder: "vendor_certifications",
      resource_type: "image",
    });
    console.log("result", result);

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    await Vendor.findByIdAndUpdate(vendorId, {
      certificationImage: result.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Certification image uploaded successfully",
      certificationImage: vendor.certificationImage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while uploading certification",
      error: error.message,
    });
  }
};
