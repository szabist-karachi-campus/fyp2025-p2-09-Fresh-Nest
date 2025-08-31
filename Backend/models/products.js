const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isBoosted: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    image: {
      type: [String],
    },
    views: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      enum: ["Kg", "g", "Ltr", "mL", "Pcs"],
      default: "Kg",
    },
  },
  { timestamps: true },
);

productSchema.statics.isProduct = async function (name) {
  if (!name) throw new Error("Product name is required");
  try {
    const product = await this.findOne({ name });
    if (product) return false;
    return true;
  } catch (error) {
    console.log("Error in isProduct", error.message);
    return false;
  }
};

module.exports = mongoose.model("Product", productSchema);
