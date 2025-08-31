const jwt = require("jsonwebtoken");
const Vendor = require("../../models/vendors");

exports.isVendorAuth = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const vendor = await Vendor.findOne({ email: decoded.email });

      if (!vendor) {
        return res
          .status(401)
          .json({ success: false, message: "Vendor not found!" });
      }

      req.vendor = vendor;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ success: false, message: "Access Unauthorized!" });
      }
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Session Expired!" });
      }
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong!" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Access Unauthorized!" });
  }
};

exports.isSuperAdmin = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const vendor = await Vendor.findOne({ email: decoded.email });

      if (!vendor) {
        return res
          .status(401)
          .json({ success: false, message: "Vendor not found!" });
      }

      if (!vendor.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Not a Super Admin!",
        });
      }

      req.vendor = vendor;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ success: false, message: "Access Unauthorized!" });
      }
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Session Expired!" });
      }
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong!" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Access Unauthorized!" });
  }
};
