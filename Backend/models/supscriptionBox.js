const mongoose = require("mongoose");

const subscriptionBoxSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      required: true,
    },
    nextDeliveryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cashless", "Cash on Delivery"],
      default: "Cash on Delivery",
    },
    // stripeCustomerId: {
    //   type: String,
    // },
    // stripeSubscriptionId: {
    //   type: String,
    // },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SubscriptionBox", subscriptionBoxSchema);
