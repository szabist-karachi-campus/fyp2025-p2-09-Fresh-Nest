// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/user");
const Product = require("../models/products");
const SubscriptionBox = require("../models/supscriptionBox");
const Wallet = require("../models/wallet");
const WalletTransaction = require("../models/walletTransactions");
const Vendor = require("../models/vendors");

// exports.createSubscription = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const { products, frequency, nextDeliveryDate, paymentMethodId, paymentMethod } = req.body;

//     const intervalMap = { daily: "day", weekly: "week", monthly: "month" };
//     const interval = intervalMap[frequency.toLowerCase()];

//     if (!interval) {
//       return res.status(400).json({ success: false, message: "Invalid frequency" });
//     }

//     // Handle Cash on Delivery
//     if (paymentMethod === "Cash on Delivery") {
//       const subscription = await SubscriptionBox.create({
//         user,
//         products,
//         frequency,
//         nextDeliveryDate,
//         paymentMethod,
//       });

//       return res.status(201).json({
//         success: true,
//         message: "Subscription created without Stripe (Cash on Delivery)",
//         subscription,
//       });
//     }

//     // Handle Cashless Method
//     if (!paymentMethodId) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment method ID is required for cashless subscriptions",
//       });
//     }

//     let stripeCustomerId = user.stripeCustomerId;

//     // Attach or create Stripe customer
//     const retrievedPM = await stripe.paymentMethods.retrieve(paymentMethodId);
//     if (retrievedPM.customer) {
//       stripeCustomerId = retrievedPM.customer;
//     } else {
//       if (!stripeCustomerId) {
//         const customer = await stripe.customers.create({
//           email: user.email,
//           name: user.name,
//         });
//         stripeCustomerId = customer.id;
//         user.stripeCustomerId = stripeCustomerId;
//         await user.save();
//       }

//       await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
//     }

//     await stripe.customers.update(stripeCustomerId, {
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     const stripeProduct = await stripe.products.create({
//       name: `Subscription Box - ${frequency}`,
//     });

//     // Calculate total amount
//     const productDocs = await Promise.all(
//       products.map((item) => Product.findById(item.product))
//     );

//     let unitAmount = 0;
//     for (let i = 0; i < productDocs.length; i++) {
//       const product = productDocs[i];
//       if (!product) {
//         return res.status(400).json({
//           success: false,
//           message: `Product not found: ${products[i].product}`,
//         });
//       }
//       unitAmount += product.price * products[i].quantity * 100; // in paisa
//     }

//     const price = await stripe.prices.create({
//       product: stripeProduct.id,
//       unit_amount: unitAmount,
//       currency: "pkr",
//       recurring: { interval },
//     });

//     const stripeSubscription = await stripe.subscriptions.create({
//       customer: stripeCustomerId,
//       items: [{ price: price.id }],
//     });

//     const subscription = await SubscriptionBox.create({
//       user,
//       products,
//       frequency,
//       nextDeliveryDate,
//       paymentMethod: "Cashless",
//       stripeCustomerId,
//       stripeSubscriptionId: stripeSubscription.id,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Subscription created successfully with Stripe",
//       subscription,
//     });

//   } catch (error) {
//     console.error("Stripe Subscription Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while creating the subscription",
//       error: error.message,
//     });
//   }
// };

exports.createSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { products, frequency, nextDeliveryDate, paymentMethod } = req.body;

    const intervalMap = { daily: "day", weekly: "week", monthly: "month" };
    const interval = intervalMap[frequency.toLowerCase()];
    if (!interval) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid frequency" });
    }

    // Calculate total subscription box amount
    const productDocs = await Promise.all(
      products.map((item) => Product.findById(item.product)),
    );

    let totalAmount = 0;
    for (let i = 0; i < productDocs.length; i++) {
      const product = productDocs[i];
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${products[i].product}`,
        });
      }
      totalAmount += product.price * products[i].quantity;
    }

    // Handle Cash on Delivery
    if (paymentMethod === "Cash on Delivery") {
      const subscription = await SubscriptionBox.create({
        user,
        products,
        frequency,
        nextDeliveryDate,
        paymentMethod,
      });

      return res.status(201).json({
        success: true,
        message: "Subscription created with Cash on Delivery",
        subscription,
      });
    }

    // Handle Wallet Payment
    if (paymentMethod === "Cashless") {
      const wallet = await Wallet.findOne({ user: user._id, userType: "User" });
      if (!wallet) {
        return res
          .status(404)
          .json({ success: false, message: "Wallet not found" });
      }

      if (wallet.balance < totalAmount) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient wallet balance" });
      }

      // Deduct from user wallet
      wallet.balance -= totalAmount;
      await wallet.save();

      await WalletTransaction.create({
        wallet: wallet._id,
        amount: totalAmount,
        transactionType: "Debit",
        description: `Subscription payment for ${frequency} box`,
      });

      const vendorAmounts = {};
      // Group amount per vendor
      for (let i = 0; i < products.length; i++) {
        const item = products[i];
        const product = await Product.findById(item.product).populate("vendor");
        const vendorId = product.vendor._id.toString();
        const amount = product.price * item.quantity;

        if (vendorAmounts[vendorId]) {
          vendorAmounts[vendorId] += amount;
        } else {
          vendorAmounts[vendorId] = amount;
        }
      }

      // Credit each vendor
      for (const [vendorId, vendorAmount] of Object.entries(vendorAmounts)) {
        const vendorWallet = await Wallet.findOne({
          user: vendorId,
          userType: "Vendor",
        });
        if (!vendorWallet) {
          console.warn(`Wallet not found for vendor ${vendorId}`);
          continue;
        }

        vendorWallet.balance += vendorAmount;
        await vendorWallet.save();

        const vendor = await Vendor.findById(vendorId);
        if (vendor?.deviceToken) {
          sendNotificationToAdminApp(
            vendor.deviceToken,
            "New Subscription",
            `${user.name} subscribed to your product.`,
          );
        }

        await WalletTransaction.create({
          wallet: vendorWallet._id,
          amount: vendorAmount,
          transactionType: "Credit",
          description: `Subscription earning for ${frequency} box`,
        });
      }

      // Create subscription box
      const subscription = await SubscriptionBox.create({
        user,
        products,
        frequency,
        nextDeliveryDate,
        paymentMethod,
      });

      return res.status(201).json({
        success: true,
        message: "Subscription created and vendor wallets credited",
        subscription,
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Unsupported payment method" });
  } catch (error) {
    console.error("Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the subscription",
      error: error.message,
    });
  }
};

exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await SubscriptionBox.find({ user: req.user._id })
      .populate({
        path: "products.product",
        select: "name price description category image vendor",
        populate: {
          path: "vendor",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No subscriptions found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User subscriptions retrieved successfully",
      subscriptions,
    });
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching subscriptions",
      error: error.message,
    });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const subscriptionId = req.headers.id;
    const { frequency, products, nextDeliveryDate, isActive } = req.body;

    // Find the subscription
    const subscription = await SubscriptionBox.findById(subscriptionId);
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Check user ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to subscription",
      });
    }

    // Validate and update frequency
    const validFrequencies = ["Daily", "Weekly", "Monthly"];
    if (frequency && !validFrequencies.includes(frequency)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid frequency value" });
    }
    if (frequency) subscription.frequency = frequency;

    // Validate and update products
    if (products && Array.isArray(products)) {
      for (const item of products) {
        const productExists = await Product.findById(item.product);
        if (!productExists) {
          return res.status(400).json({
            success: false,
            message: `Product not found: ${item.product}`,
          });
        }
      }
      subscription.products = products;
    }

    // Update next delivery date
    if (nextDeliveryDate) {
      subscription.nextDeliveryDate = new Date(nextDeliveryDate);
    }

    // Update isActive (pause/unpause)
    if (typeof isActive === "boolean") {
      subscription.isActive = isActive;
    }

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Update Subscription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the subscription",
      error: error.message,
    });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const subscriptionId = req.headers.id;

    // Find the subscription
    const subscription = await SubscriptionBox.findById(subscriptionId);
    if (!subscription) {
      console.log("yhaan phata");
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Check user ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to subscription",
      });
    }

    // Delete the subscription
    await SubscriptionBox.findByIdAndDelete(subscriptionId);

    return res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("Delete Subscription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the subscription",
      error: error.message,
    });
  }
};
