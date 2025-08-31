const cron = require("node-cron");
const SubscriptionBox = require("../models/supscriptionBox");
const Product = require("../models/products");
const Wallet = require("../models/wallet");
const WalletTransaction = require("../models/walletTransactions");
const Order = require("../models/orders");

const calculateNextDeliveryDate = (currentDate, frequency) => {
  const date = new Date(currentDate);
  switch (frequency) {
    case "Daily":
      date.setDate(date.getDate() + 1);
      break;
    case "Weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "Monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      break;
  }
  return date;
};

// Run every day at 2 AM — change to */10 * * * * * for testing
cron.schedule("0 2 * * *", async () => {
  console.log("🔄 Running subscription check...");

  try {
    const today = new Date();

    const subscriptions = await SubscriptionBox.find({
      isActive: true,
      nextDeliveryDate: { $lte: today },
    }).populate("user", "name");

    for (const subscription of subscriptions) {
      const user = subscription.user;

      // Fetch product data with vendor
      const productDocs = await Promise.all(
        subscription.products.map((item) =>
          Product.findById(item.product).populate("vendor"),
        ),
      );

      let totalAmount = 0;
      const vendorMap = new Map();

      for (let i = 0; i < productDocs.length; i++) {
        const product = productDocs[i];
        const vendorId = product.vendor._id.toString();
        const quantity = subscription.products[i].quantity;

        if (!product) {
          console.log(
            `❌ Product not found: ${subscription.products[i].product}`,
          );
          continue;
        }

        // Group by vendor
        if (!vendorMap.has(vendorId)) {
          vendorMap.set(vendorId, {
            products: [],
            quantities: [],
            total: 0,
          });
        }

        const entry = vendorMap.get(vendorId);
        entry.products.push(product._id);
        entry.quantities.push(quantity);
        entry.total += product.price * quantity;

        // Accumulate total for cashless payments
        totalAmount += product.price * quantity;
      }

      if (subscription.paymentMethod === "Cashless") {
        const wallet = await Wallet.findOne({
          user: user._id,
          userType: "User",
        });
        if (!wallet || wallet.balance < totalAmount) {
          console.log(
            `⚠️ Wallet issue or insufficient funds for user ${user.name}`,
          );
          continue;
        }

        // Deduct from user
        wallet.balance -= totalAmount;
        await wallet.save();

        await WalletTransaction.create({
          wallet: wallet._id,
          amount: totalAmount,
          transactionType: "Debit",
          description: `Subscription payment for ${subscription.frequency} box`,
        });

        // Credit vendors
        for (let [vendorId, entry] of vendorMap.entries()) {
          const vendorWallet = await Wallet.findOne({
            user: vendorId,
            userType: "Vendor",
          });

          if (vendorWallet) {
            vendorWallet.balance += entry.total;
            await vendorWallet.save();

            await WalletTransaction.create({
              wallet: vendorWallet._id,
              amount: entry.total,
              transactionType: "Credit",
              description: `Subscription payout from user ${user.name}`,
            });
          } else {
            console.log(`⚠️ Vendor wallet not found: ${vendorId}`);
          }
        }
      }

      // Create Orders (for both Cashless and COD)
      let firstOrderNo = null;
      for (let [vendorId, entry] of vendorMap.entries()) {
        const order = new Order({
          vendor: vendorId,
          user: user._id,
          products: entry.products,
          quantities: entry.quantities,
          total: entry.total,
          status: "Pending",
          paymentStatus:
            subscription.paymentMethod === "Cashless" ? "Paid" : "Unpaid",
          paymentMethod: subscription.paymentMethod,
        });

        if (!firstOrderNo) {
          firstOrderNo = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        order.orderNo = firstOrderNo;

        await order.save();
      }

      // Update next delivery date
      subscription.nextDeliveryDate = calculateNextDeliveryDate(
        subscription.nextDeliveryDate,
        subscription.frequency,
      );
      await subscription.save();

      if (user?.deviceToken) {
        sendNotificationToAdminApp(
          user.deviceToken,
          "Subscription Order Placed",
          `Your ${subscription.frequency} subscription order (#${firstOrderNo}) has been placed.`,
        );
      }

      console.log(
        `✅ Processed ${subscription.paymentMethod} subscription for user ${user._id}`,
      );
    }
  } catch (err) {
    console.error("❌ Subscription Cron Error:", err.message);
  }
});
