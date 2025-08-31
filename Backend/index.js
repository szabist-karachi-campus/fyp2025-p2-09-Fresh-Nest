require("dotenv").config();
require("./models/db");
require("./cron/subscriptionProcessor");
const express = require("express");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Wallet = require("./models/wallet");
const Order = require("./models/orders");
const WalletTransaction = require("./models/walletTransactions");

const userRouter = require("./routes/user");
const categoryRouter = require("./routes/category");
const productRouter = require("./routes/product");
const vendorRouter = require("./routes/vendor");
const OrderRouter = require("./routes/order");
const AdsRouter = require("./routes/ads");
const PaymentRouter = require("./routes/payments");
const WalletRouter = require("./routes/wallet");
const AnalyticsRouter = require("./routes/analytics");
const SubscriptionRouter = require("./routes/subscription");
const superAdminRouter = require("./routes/superAdmin");
const messageRouter = require("./routes/message");
const app = express();

app.post(
  "/wallet-payment-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      console.log("✅ Webhook received:", event.type);

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        const userId = paymentIntent.metadata.userId;
        const topup = paymentIntent.metadata.topup;
        const orderNo = paymentIntent.metadata.orderNo;
        const amount = paymentIntent.amount;
        const userType = paymentIntent.metadata.userType;

        if (!userId || !amount) {
          console.error("❌ Missing userId or amount in metadata");
          return res.status(400).send("Missing userId or amount");
        }

        const amountInRupees = amount / 100;

        // ✅ Handle Wallet Top-Up
        if (topup === "true" || topup === true) {
          let wallet = await Wallet.findOne({ user: userId });

          // if (!wallet) {
          //   wallet = await Wallet.create({
          //     user: userId,
          //     userType: userType || "User",
          //     balance: amountInRupees,
          //   });
          //   console.log("✅ Wallet created for top-up:", wallet._id);
          // } else {
          // }
          wallet.balance += amountInRupees;
          await wallet.save();
          console.log("✅ Wallet balance updated:", wallet._id);

          await WalletTransaction.create({
            wallet: wallet._id,
            amount: amountInRupees,
            transactionType: "Credit",
            description: "Wallet top-up via Stripe",
          });

          return res.status(200).send("✅ Wallet top-up processed");
        }

        // ✅ Handle Order Payment & Vendor Wallet Payouts
        const orders = await Order.find({ orderNo }).populate("products");

        if (!orders || orders.length === 0) {
          console.error("❌ No orders found for orderNo:", orderNo);
          return res.status(404).send("No orders found");
        }

        // Mark orders as paid
        for (const order of orders) {
          await Order.findByIdAndUpdate(order._id, {
            paymentStatus: "Paid",
          });
        }

        // Aggregate total per vendor
        const vendorAmounts = {};

        for (const order of orders) {
          order.products.forEach((product, idx) => {
            const vendorId = product.vendor.toString();
            const quantity = order.quantities[idx] || 1;
            const productTotal = product.price * quantity;

            if (!vendorAmounts[vendorId]) {
              vendorAmounts[vendorId] = 0;
            }

            vendorAmounts[vendorId] += productTotal;
          });
        }

        // Update each vendor wallet
        for (const vendorId of Object.keys(vendorAmounts)) {
          const vendorAmount = vendorAmounts[vendorId];

          let wallet = await Wallet.findOne({ user: vendorId });

          // if (!wallet) {
          //   wallet = await Wallet.create({
          //     user: vendorId,
          //     userType: "Vendor",
          //     balance: vendorAmount,
          //   });
          //   console.log(`✅ Created wallet for vendor ${vendorId}`);
          // } else {
          // }
          wallet.balance += vendorAmount;
          await wallet.save();
          console.log(`✅ Updated wallet for vendor ${vendorId}`);

          await WalletTransaction.create({
            wallet: wallet._id,
            amount: vendorAmount,
            transactionType: "Credit",
            description: `Payment for Order no. ${orderNo}`,
          });
        }

        return res.status(200).send("✅ Vendor payouts completed");
      }

      res.status(200).send("✅ Webhook received");
    } catch (err) {
      console.error("❌ Webhook error:", err.message);
      return res.status(500).send(`Webhook error: ${err.message}`);
    }
  },
);

app.use(express.json());
app.use(userRouter);
app.use(categoryRouter);
app.use(productRouter);
app.use(vendorRouter);
app.use(OrderRouter);
app.use(AdsRouter);
app.use(PaymentRouter);
app.use(WalletRouter);
app.use(AnalyticsRouter);
app.use(SubscriptionRouter);
app.use(superAdminRouter);
app.use(messageRouter);

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/complete", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding-top: 100px;">
        <h2>✅ Stripe onboarding complete!</h2>
        <p>You can now return to the app.</p>
      </body>
    </html>
  `);
});
app.get("/reauth", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding-top: 100px;">
        <h2>❗ Onboarding incomplete</h2>
        <p>You can restart the setup from the app.</p>
      </body>
    </html>
  `);
});
app.get("/testing", async (req, res) => {
  const account = await stripe.accounts.retrieve("acct_1RbqHYGhKIaXWGoC");

  console.log("Charges Enabled:", account.charges_enabled);
  console.log("Payouts Enabled:", account.payouts_enabled);
  console.log("Details Submitted:", account.details_submitted);
});
app.get("/testing2", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 50000, // $500.00
    currency: "usd",
    payment_method_types: ["card"],
    description: "Test top-up for platform",
  });
  return res.status(200).json({
    success: true,
    message: "Payment Intent created successfully",
    paymentIntent,
  });
});
app.listen(port, () => {
  console.log("Server is running on port", port);
});
