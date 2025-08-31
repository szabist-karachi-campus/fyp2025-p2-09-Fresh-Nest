const Products = require("../models/products");
const Category = require("../models/category");
const Ads = require("../models/ads");
const cloudinary = require("../helper/cloudinary");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category, unit } = req.body;
    const vendor = req.vendor._id;

    const product = new Products({
      name,
      price,
      description,
      category,
      vendor,
      unit,
    });

    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category does not exist.",
      });
    }

    product.category = categoryExists.name;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category } = req.body;
    const vendor = req.vendor._id;

    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.vendor.toString() !== vendor.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this product",
      });
    }

    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message:
          "Category does not exist. Please provide a valid category name.",
      });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = categoryExists.name;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = req.vendor._id;
    const product = await Products.findById(id);
    const ad = await Ads.findOne({ product: id });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.vendor.toString() !== vendor.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this product",
      });
    }

    if (ad) {
      Ads.deleteOne({ product: id });
    }

    await Products.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.uploadProductImage = async (req, res) => {
  try {
    const productID = req.params.id;

    if (!productID) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Products.findById(productID);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.vendor.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Authorization failed: Vendor mismatch",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.cloudinary.uploader.upload(file.path, {
        folder: "products",
        resource_type: "image",
      });
      imageUrls.push(result.secure_url);
    }

    product.image = imageUrls;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: product.image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Products.find().populate("vendor", "name");
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getVendorProducts = async (req, res) => {
  try {
    const vendor = req.vendor._id;
    const products = await Products.find({ vendor });
    res.status(200).json({
      success: true,
      message: "Vendor products retrieved successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id).populate("vendor", "name");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.viewCount = async (req, res) => {
  try {
    const { id } = req.body;

    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.views += 1;
    await product.save();

    const ad = await Ads.findOne({ product: id });
    if (ad && ad.status === "Active") {
      ad.views += 1;
      await ad.save();
    }

    res.status(200).json({
      success: true,
      message: "View count updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};
