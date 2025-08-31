const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const Vendor = require("../../models/vendors");

exports.isAuth = async (req, res, next) => {
  try {
    // Check for Authorization header
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "Access Unauthorized! No token provided.",
      });
    }

    // Extract the token
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Unauthorized! Invalid token format.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from token payload
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found! Access Forbidden." });
    }

    // Attach the user to request object
    req.user = user;

    next(); // Proceed to the next middleware/route
  } catch (error) {
    // Handle specific token errors
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Token!" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session Expired! Please login again.",
      });
    }

    // Generic server error
    console.error("Authentication Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error!" });
  }
};

exports.isCombinedAuth = async (req, res, next) => {
  try {
    // Check for Authorization header
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "Access Unauthorized! No token provided.",
      });
    }

    // Extract the token
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Unauthorized! Invalid token format.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId) {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(403).json({
          success: false,
          message: "User not found! Access Forbidden.",
        });
      }

      req.user = user;

      next();
    } else {
      const vendor = await Vendor.findOne({ email: decoded.email });

      if (!vendor) {
        return res
          .status(401)
          .json({ success: false, message: "Vendor not found!" });
      }

      req.user = vendor;
      next();
    }
  } catch (error) {
    // Handle specific token errors
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Token!" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session Expired! Please login again.",
      });
    }

    // Generic server error
    console.error("Authentication Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error!" });
  }
};
